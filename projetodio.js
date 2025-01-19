const { app } = require('@azure/functions');

app.http('validateCpf', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log(`HTTP function processed request for url "${request.url}"`);

        const cpf = request.query.get('cpf') || await request.text();

        if (!cpf) {
            return { status: 400, body: JSON.stringify({ message: "Por favor, forneça um CPF para validação." }) };
        }

        function isValidCPF(cpf) {
            cpf = cpf.replace(/[^\d]+/g, '');
            if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;
            
            let soma = 0;
            let resto;

            for (let i = 1; i <= 9; i++) {
                soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
            }
            resto = (soma * 10) % 11;
            if ((resto === 10) || (resto === 11)) resto = 0;
            if (resto !== parseInt(cpf.substring(9, 10))) return false;

            soma = 0;
            for (let i = 1; i <= 10; i++) {
                soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
            }
            resto = (soma * 10) % 11;
            if ((resto === 10) || (resto === 11)) resto = 0;
            if (resto !== parseInt(cpf.substring(10, 11))) return false;

            return true;
        }

        const valid = isValidCPF(cpf);
        const message = valid ? "O CPF fornecido é válido." : "O CPF fornecido é inválido.";

        return {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                cpf: cpf,
                valid: valid,
                message: message
            })
        };
    }
});
