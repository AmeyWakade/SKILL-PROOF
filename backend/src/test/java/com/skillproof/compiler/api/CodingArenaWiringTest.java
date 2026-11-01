package com.skillproof.compiler.api;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import static org.junit.jupiter.api.Assertions.assertNotNull;

class CodingArenaWiringTest {
    @Test
    void productionConstructorIsExplicitlySelectedForSpringInjection() throws Exception {
        var constructor = CodingArenaController.class.getConstructor(CompilerController.class);

        assertNotNull(constructor.getAnnotation(Autowired.class));
    }
}
