const express = require('express');
const cors = require('cors');
const app = express();

const Home = require('./models/Home');
const MsgContact = require('./models/MsgContact');
const NR04_Sesmt = require('./models/NR04_Sesmt');
const NR04_Cnae_Gr = require('./models/NR04_Cnae_Gr');
const NR05_Cipa = require('./models/NR05_Cipa');
const { Sequelize, Op, DataTypes } = require('sequelize');
const sequelize = require('./models/db');

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
app.post('/nr04-05-consulta', async (req,res) =>{

    const codigoCnaeInserido = req.body.codigo_cnae;
    const numero_trabalhadores_inserido = req.body.numero_trabalhadores;

    //estrutura para resposta
    var respostaConsultaTabelas = {
        status: 200,
        erro: false,
        mensagem: '',
        cnae: '',
        denominacao: '',
        grauDeRisco: '',
        nroTrabalhadores: numero_trabalhadores_inserido,
        nroTrabalhadoresMinSesmt: '',
        nroTrabalhadoresMaxSesmt: '',
        tecnicoSeg: '',
        engenheiroSeg: '',
        auxTecEnfermagem: '',
        enfermeiro: '',
        medico: '',
        nroTrabalhadoresMinCipa: '',
        nroTrabalhadoresMaxCipa: '',
        cipaEfetivos: '',
        cipaSuplentes: ''
    };

    //verifica conexão com o DB
    sequelize.authenticate()
    .then(() => {
        //console.log("Conexão com banco de dados realizada com sucesso!");
    }).catch(() => {
        respostaConsultaTabelas.status = 400;
        respostaConsultaTabelas.erro = true;
        respostaConsultaTabelas.mensagem = 'Erro: não foi possível connectar ao banco de dados';

        //console.log("Erro: conexão com banco de dados não realizada com sucesso!");
    })
    
    var grauRiscoConsultado;
    var denominacaoCnaeConsultada;
    var codigoCnaeConsultado;

    
    console.log(codigoCnaeInserido, numero_trabalhadores_inserido);


    if(!respostaConsultaTabelas.erro)
    {
        //consulta tabela CNAEs
        const cnae_table = await NR04_Cnae_Gr.findAll({
            //consulta linha para encontrar o CNAE inserido
            where:{
                "codigo_cnae": codigoCnaeInserido,
            },
            //retorna os atributos listados
            attributes: ['id', 'codigo_cnae', 'denominacao', 'grau_risco']
        })
        .then((cnae_table) => {
            //se deu tudo certo, atribui os valores consultados a variável de resposta
            respostaConsultaTabelas.cnae = cnae_table[0].codigo_cnae;
            respostaConsultaTabelas.denominacao = cnae_table[0].denominacao;
            respostaConsultaTabelas.grauDeRisco = cnae_table[0].grau_risco;
        })
        .catch(()=>{
            //se ocorreu algum erro, preenche informações para retornar ao front
            respostaConsultaTabelas.status = 400;
            respostaConsultaTabelas.erro = true;
            respostaConsultaTabelas.mensagem = 'Erro: Nenhum valor encontrado com o CNAE informado.'

            /*
            respostaConsultaTabelas.mensagem = 'Não foi possível encontrar o CNAE fornecido na base de dados.';
            return res.status(400).json({
                erro: true,
                mensagem: "Erro: Nenhum valor encontrado com o CNAE informado"
            })
            */
        })
    }
    if(!respostaConsultaTabelas.erro)
    {
        //consulta tabela SESMT
        const sesmt_table = await NR04_Sesmt.findAll({
            //consulta pelo grau de risco consultado na tabela anterior
            //e pelo numero de trabalhadores informado entre os limites de cada faixa
            where:{
                grau_risco: respostaConsultaTabelas.grauDeRisco,
                nro_trabalhadores_min: {[Op.lte]: respostaConsultaTabelas.nroTrabalhadores},
                nro_trabalhadores_max: {[Op.gte]: respostaConsultaTabelas.nroTrabalhadores}
            },
            //retorna os seguintes atributos da tabela
            attributes: ['id', 'grau_risco', 'nro_trabalhadores_min', 'nro_trabalhadores_max', 'tecnico_seg','engenheiro_seg','aux_tec_enfermagem','enfermeiro','medico']
        })
        .then((sesmt_table) => {
            //se deu tudo certo, atribui os valores consultados a variável de resposta
            respostaConsultaTabelas.nroTrabalhadoresMinSesmt = sesmt_table[0].nro_trabalhadores_min;
            respostaConsultaTabelas.nroTrabalhadoresMaxSesmt = sesmt_table[0].nro_trabalhadores_max;
            respostaConsultaTabelas.tecnicoSeg = sesmt_table[0].tecnico_seg;
            respostaConsultaTabelas.engenheiroSeg = sesmt_table[0].engenheiro_seg;
            respostaConsultaTabelas.auxTecEnfermagem = sesmt_table[0].aux_tec_enfermagem;
            respostaConsultaTabelas.enfermeiro = sesmt_table[0].enfermeiro;
            respostaConsultaTabelas.medico = sesmt_table[0].medico;
        })
        .catch(()=>{
            //se ocorreu algum erro, preenche informações para retornar ao front
            respostaConsultaTabelas.status = 400;
            respostaConsultaTabelas.erro = true;
            respostaConsultaTabelas.mensagem = 'Erro: Nenhum valor encontrado da base de dados da equipe SESMT.'      
        })
     
    }
    
    if(!respostaConsultaTabelas.erro)
    {
        //consulta tabela CIPA
        const cipa_table = await NR05_Cipa.findAll({
            //consulta pelo grau de risco consultado na tabela anterior
            //e pelo numero de trabalhadores informado entre os limites de cada faixa
            where:{
                grau_risco: respostaConsultaTabelas.grauDeRisco,
                nro_trabalhadores_min: {[Op.lte]: respostaConsultaTabelas.nroTrabalhadores},
                nro_trabalhadores_max: {[Op.gte]: respostaConsultaTabelas.nroTrabalhadores}
            },
            //retorna os seguintes atributos da tabela
            attributes: ['id', 'grau_risco', 'nro_trabalhadores_min', 'nro_trabalhadores_max', 'integrantes_efetivos','integrantes_suplentes']
        })
        .then((cipa_table) => {
            //se deu tudo certo, atribui os valores consultados a variável de resposta
            respostaConsultaTabelas.nroTrabalhadoresMinCipa = cipa_table[0].nro_trabalhadores_min;
            respostaConsultaTabelas.nroTrabalhadoresMaxCipa = cipa_table[0].nro_trabalhadores_max;
            respostaConsultaTabelas.cipaEfetivos = cipa_table[0].integrantes_efetivos;
            respostaConsultaTabelas.cipaSuplentes = cipa_table[0].integrantes_suplentes;

            //Última consulta, escreve mensagem de aprovação
            respostaConsultaTabelas.mensagem = 'Todos dados consultados com sucesso' 
        })
        .catch(()=>{
            //se ocorreu algum erro, preenche informações para retornar ao front
            respostaConsultaTabelas.status = 400;
            respostaConsultaTabelas.erro = true;
            respostaConsultaTabelas.mensagem = 'Erro: Nenhum valor encontrado da base de dados da equipe CIPA.'       
        })
    }

    //retorno para front
    return res.status(respostaConsultaTabelas.status).json({respostaConsultaTabelas});
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