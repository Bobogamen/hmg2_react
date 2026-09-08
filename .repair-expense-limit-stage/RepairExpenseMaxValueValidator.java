package com.validation;

import com.service.AppSettingService;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import lombok.RequiredArgsConstructor;
import org.hibernate.validator.constraintvalidation.HibernateConstraintValidatorContext;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
@RequiredArgsConstructor
public class RepairExpenseMaxValueValidator implements ConstraintValidator<RepairExpenseMaxValue, BigDecimal> {

    private final AppSettingService appSettingService;

    @Override
    public boolean isValid(BigDecimal value, ConstraintValidatorContext context) {

        if (value == null) {
            return true;
        }

        BigDecimal expenseMaxValue = BigDecimal.valueOf(this.appSettingService.getRepairExpenseMaxValue());

        if (value.compareTo(expenseMaxValue) <= 0) {
            return true;
        }

        context.disableDefaultConstraintViolation();

        HibernateConstraintValidatorContext hibernateContext =
                context.unwrap(HibernateConstraintValidatorContext.class);

        hibernateContext
                .addMessageParameter("value", expenseMaxValue)
                .buildConstraintViolationWithTemplate("notMoreThanMaxValue")
                .addConstraintViolation();

        return false;
    }
}
