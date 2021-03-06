package br.gov.basis.sap.sapservice.web.rest;

import br.gov.basis.sap.sapservice.builder.TipoStatusBuilder;
import br.gov.basis.sap.sapservice.util.IntTestComum;
import org.junit.jupiter.api.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.transaction.annotation.Transactional;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@RunWith(SpringRunner.class)
@Transactional
public class TipoStatusRecursoIT extends IntTestComum {
    @Autowired
    private TipoStatusBuilder tipoStatusBuilder;

    private static String RECURSO = "/dominios/tipos-status";

    @Test
    public void obterTodosTest() throws Exception {
        getMockMvc().perform(get(RECURSO))
            .andExpect(status().isOk());
    }

}

