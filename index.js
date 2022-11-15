const express = require('express');
const cors = require('cors');
const app = express();

const Home = require('./models/Home');
const MsgContact = require('./models/MsgContact');
const NR04_Sesmt = require('./models/NR04_Sesmt');


app.use(express.json());

//app.options('*', cors());

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, PUT, POST");
    res.header("Access-Control-Allow-Headers", "X-PINGOTHER, Content-Type, Authorization");
    app.use(cors());
    next();
});


//home page
app.get('/', async (req,res) => {
    /*return res.json({
        erro: false,
        datahome: {
            text_one: "Temos a solução", 
            text_two: "que a sua empresa precisa", 
            text_three: "Podemos ajudar a sua empresa!",
            btn_title:"Entrar em Contato", 
            btn_link:"http://localhost:3000/contato"
        }
    })*/
    await Home.findOne({
        //seleção das colunas que são necessárias
        attributes: ['text_one', 'text_two', 'text_three', 'btn_title', 'btn_link']
    })
    .then((dataHome) => {
        return res.json({
            erro: false,
            dataHome
        })
    }).catch(()=>{
        return res.status(400).json({
            erro: true,
            mensagem: "Erro: Nenhum valor encontrado para a página Home"
        })
    })
})

//consulta DB NR04-SESMT
app.post('/nr04-sesmt-consulta', async (req,res) =>{
    //grauRiscoInserido = 3;
    //faixa_trabalhadores_inserida = 7;

    const grauRiscoInserido = req.body.grau_risco;
    const faixa_trabalhadores_inserida = req.body.faixa_trabalhadores;
    console.log(grauRiscoInserido, faixa_trabalhadores_inserida);



    const sesmt_table = await NR04_Sesmt.findAll({
        where:{
            "grau_risco": grauRiscoInserido,
            "faixa_trabalhadores": faixa_trabalhadores_inserida
        },
        attributes: ['id', 'grau_risco', 'nro_trabalhadores', 'faixa_trabalhadores', 'tecnico_seg','engenheiro_seg','aux_tec_enfermagem','enfermeiro','medico']
    })
    .then((sesmt_table) => {
        return res.json({
            erro: false,
            sesmt_table
        })
    }).catch(()=>{
        return res.status(400).json({
            erro: true,
            mensagem: "Erro: Nenhum valor encontrado para a página Home"
        })
    })
    
})

//??
app.get('/nr04-sesmt', async (req,res) => {
    /*
    return res.json({
        erro: false,
        datahome: {
            "grau_risco": "4",
            "nro_trabalhadores": "Acima de 5000",
            "faixa_trabalhadores": "8",
            "tecnico_seg": "3",
            "engenheiro_seg": "1",
            "aux_tec_enfermagem": "1",
            "enfermeiro": "0",
            "medico": "1"
        }
    })
    *//*
    const sesmt_table = await NR04_Sesmt.findAll({
        where:{
            "grau_risco": grauRiscoInserido,
            "faixa_trabalhadores": faixa_trabalhadores
        },
        attributes: ['id', 'grau_risco', 'nro_trabalhadores', 'faixa_trabalhadores', 'tecnico_seg','engenheiro_seg','aux_tec_enfermagem','enfermeiro','medico']
    })
    .then((sesmt_table) => {
        return res.json({
            erro: false,
            sesmt_table
        })
    }).catch(()=>{
        return res.status(400).json({
            erro: true,
            mensagem: "Erro: Nenhum valor encontrado para a página Home"
        })
    })*/

    const grauRiscoInserido = req.body.grau_risco;
    const faixa_trabalhadores_inserida = req.body.faixa_trabalhadores;
    console.log(grauRiscoInserido, faixa_trabalhadores_inserida);



    const sesmt_table = await NR04_Sesmt.findAll({
        where:{
            "grau_risco": grauRiscoInserido,
            "faixa_trabalhadores": faixa_trabalhadores_inserida
        },
        attributes: ['id', 'grau_risco', 'nro_trabalhadores', 'faixa_trabalhadores', 'tecnico_seg','engenheiro_seg','aux_tec_enfermagem','enfermeiro','medico']
    })
    .then((sesmt_table) => {
        return res.json({
            erro: false,
            sesmt_table
        })
    }).catch(()=>{
        return res.status(400).json({
            erro: true,
            mensagem: "Erro: Nenhum valor encontrado para a página Home"
        })
    })



})

//modificar textos home page
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

//tela de contato, adiciona mensagem
app.post('/add-msg-contact', async (req, res) => {
    console.log(req.body)

    //salvar no db
    await MsgContact.create(req.body)
    .then((msgContact) =>{
        return res.json({
            erro: false,
            id: msgContact.id,
            mensagem: "Mensagem de contato enviada com sucesso!"
        })

    }).catch(()=>{
        return res.status(400).json({
            erro: true,
            mensagem: "Erro: não foi possivel salvar sua mensagem"
        });
    })
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`Servidor iniciado na porta ${port}`);
})