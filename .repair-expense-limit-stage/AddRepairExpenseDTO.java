package com.model.dto;

import com.validation.RepairExpenseMaxValue;
import jakarta.validation.constraints.*;
import org.hibernate.validator.constraints.Length;

import java.math.BigDecimal;
import java.time.LocalDate;

public record AddRepairExpenseDTO(

        @NotBlank(message = "notBlank")
        @Length(min = 3, max = 20, message = "lengthBetween")
        String name,

        @NotNull(message = "notBlank")
        @Positive(message = "positiveNumber")
        @RepairExpenseMaxValue(message = "notMoreThanMaxValue")
        BigDecimal value,

        @NotBlank(message = "notBlank")
        @Length(min = 1, max = 30, message = "lengthBetween")
        String documentNumber,

        @NotNull(message = "notBlank")
        @PastOrPresent(message = "pastOrPresent")
        LocalDate documentDate) {
}
