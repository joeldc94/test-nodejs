const express = require('express');
const cors = require('cors');
const app = express();

const NR04_Sesmt = require('./models/NR04_Sesmt');

app.use(express.json());

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
    res.header("Access-Control-Allow-Headers", "X-PINGOTHER, Content-Type, Authorization");
    app.use(cors());
    next();
});
/*
app.post('/add-home',async (req, res) =>{
    
    //verifica se já há um registro no banco
    const dataHome = await Home.findOne();

    //se houver registro, não permite o cadastro de novos
    if(dataHome){
        return res.status(400).json({
            erro: true,
            mensagem: "Erro: Dados para página home não cadastrados. A página já possui um registro!"
        });

    }
    //cadastrando dados no db
    await Home.create(req.body)
    .then(()=>{
        return res.json({
            erro: false,
            mensagem: "Dados para página home cadastrados com sucesso!"
        });

    }).catch(()=>{
        return res.status(400).json({
            erro: true,
            mensagem: "Erro: Dados para página home não cadastrados!"
        });
    })
})
*/

app.post('/add-nr04', async (req, res) => {
    console.log(req.body)

    //salvar no db
    await NR04_Sesmt.create(req.body)
    .then((row) =>{
        return res.json({
            erro: false,
            id: row.id,
            "grau de risco": row.grau_risco,
            "faixa": row.faixa_trabalhadores,
            status: "Linha cadastrada com sucesso!"
        })

    }).catch(()=>{
        return res.status(400).json({
            erro: true,
            status: "Erro: não foi possivel cadastrar"
        });
    })
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`Servidor iniciado na porta ${port}`);
})