package com.web;

import com.configuration.SecurityConfiguration;
import com.configuration.SecurityService;
import com.configuration.WebConfiguration;
import com.configuration.JWT.JWTAuthenticationFilter;
import com.configuration.JWT.JwtService;
import com.repository.ManagementRepository;
import com.service.AppSettingService;
import com.service.RepairAccountingService;
import com.service.implementation.HomeManagerUserDetailsService;
import com.user.CurrentUserAugmentResolver;
import com.user.AuthUserProvider;
import com.user.HomeManagerUserDetails;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import java.time.LocalDate;
import java.util.List;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(RepairAccountingController.class)
@Import({SecurityConfiguration.class, SecurityService.class, WebConfiguration.class,
        JWTAuthenticationFilter.class, CurrentUserAugmentResolver.class, AuthUserProvider.class})
class RepairAccountingWebTest {
    @Autowired MockMvc mvc;
    @MockitoBean RepairAccountingService service;
    @MockitoBean AppSettingService settings;
    @MockitoBean ManagementRepository management;
    @MockitoBean HomeManagerUserDetailsService users;
    @MockitoBean JwtService jwt;
    private final HomeManagerUserDetails owner = new HomeManagerUserDetails(7L, "manager@example.test", "Manager", "",
            LocalDate.now(), List.of(new SimpleGrantedAuthority("ROLE_MANAGER")));
    private static final String PATH = "/management/condominiums/1/repairs/5";
    private static final String VALID = """
        {"name":"Materials","value":"10.25","documentNumber":"INV-1","documentDate":"2026-01-01"}
        """;

    @BeforeEach void setup() {
        when(management.isUserOwner(1L, 7L)).thenReturn(true);
        when(settings.getRepairExpenseMaxValue()).thenReturn(100.1);
    }

    @Test void validExpenseUsesRepairFromRoute() throws Exception {
        mvc.perform(post(PATH + "/expenses").with(user(owner)).contentType(MediaType.APPLICATION_JSON).content(VALID))
                .andExpect(status().isCreated());
        verify(service).addExpense(eq(1L), eq(5L), any(), eq("manager@example.test"));
    }

    @Test void emptyFormReturnsFieldErrors() throws Exception {
        mvc.perform(post(PATH + "/expenses").with(user(owner)).contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.name").isArray())
                .andExpect(jsonPath("$.errors.value").isArray())
                .andExpect(jsonPath("$.errors.addedOn").doesNotExist())
                .andExpect(jsonPath("$.errors.documentDate").isArray())
                .andExpect(jsonPath("$.errors.documentNumber").isArray());
        verifyNoInteractions(service);
    }

    @Test void rejectsNonPositiveOrExcessiveValuesAndFutureDates() throws Exception {
        for (String value : List.of("-5", "0", "100.11", "10000000000")) {
            mvc.perform(post(PATH + "/expenses").with(user(owner)).contentType(MediaType.APPLICATION_JSON)
                    .content(VALID.replace("10.25", value))).andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.errors.value").isArray());
        }
        mvc.perform(post(PATH + "/expenses").with(user(owner)).contentType(MediaType.APPLICATION_JSON)
                .content(VALID.replace("2026-01-01", LocalDate.now().plusDays(1).toString())))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.errors.documentDate").isArray());
        verifyNoInteractions(service);
    }

    @Test void expenseLimitIsInclusiveAndReturnsConfiguredMaximum() throws Exception {
        mvc.perform(post(PATH + "/expenses").with(user(owner)).contentType(MediaType.APPLICATION_JSON)
                .content(VALID.replace("10.25", "100.10"))).andExpect(status().isCreated());
        verify(service).addExpense(eq(1L), eq(5L), any(), eq("manager@example.test"));
        clearInvocations(service);

        mvc.perform(post(PATH + "/expenses").with(user(owner)).contentType(MediaType.APPLICATION_JSON)
                .content(VALID.replace("10.25", "100.11"))).andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.value[0].code").value("notMoreThanMaxValue"))
                .andExpect(jsonPath("$.errors.value[0].args.value").value(100.1));
        verifyNoInteractions(service);
        verify(settings, never()).getFeeMaxValue();
    }

    @Test void otherOwnersCannotReadDetailsOrAddExpenses() throws Exception {
        when(management.isUserOwner(1L, 7L)).thenReturn(false);
        mvc.perform(get(PATH + "/details").with(user(owner))).andExpect(status().isForbidden());
        mvc.perform(post(PATH + "/expenses").with(user(owner)).contentType(MediaType.APPLICATION_JSON).content(VALID))
                .andExpect(status().isForbidden());
        verifyNoInteractions(service);
    }

    @Test void unauthenticatedRequestsAreDenied() throws Exception {
        mvc.perform(get(PATH + "/details")).andExpect(status().isForbidden());
        mvc.perform(post(PATH + "/expenses").contentType(MediaType.APPLICATION_JSON).content(VALID)).andExpect(status().isForbidden());
        verifyNoInteractions(service);
    }
}
