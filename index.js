const express = require('express');
const cors = require('cors');
const app = express();
const https = require('https');
const got = require('got');

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

    const cnpjInserido = req.body.cnpj;
    const codigoCnae1Inserido = req.body.codigo_cnae1;;
    const codigoCnae2Inserido = req.body.codigo_cnae2;
    const numero_trabalhadores_inserido = req.body.numero_trabalhadores;

    //>>>verificar numero de trabalhadores

    //estrutura para resposta
    var respostaConsultaTabelas = {
        status: 200,
        erro: false,        
        mensagem: '',
        nroTrabalhadores: numero_trabalhadores_inserido,
        codigosCnae: [],
        descricaoCnae: []
        /*
        cnae: '',
        denominacao: '',
        grauDeRisco: '',
        
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
        */
        
    };
    //console.log(process.env.URL_API_MINHARECEITA + cnpjInserido);

    if(cnpjInserido){
        //consulta informações no CNPJ inserido
       
        //try{
            console.log('CNPJ INSERIDO!!!' + cnpjInserido);
            //const c = cnpj.consultaCnpj(cnpjInserido).then(console.log(c));
            


    
        try {
            const response = await got(process.env.URL_API_MINHARECEITA + cnpjInserido, { json: true });
            console.log('AQUI!!!');
            //console.log(response);
            console.log(response.body.cnae_fiscal);
            const c = JSON.stringify(response.body.cnae_fiscal);
            respostaConsultaTabelas.codigosCnae[0] = c.charAt(0)+c.charAt(1)+'.'+c.charAt(2)+c.charAt(3)+'-'+c.charAt(4);
            console.log(respostaConsultaTabelas.codigosCnae[0]);
            //respostaConsultaTabelas.codigosCnae[0] = response.body.cnae_fiscal;
        } catch (error) {
            console.log(error.response.body);
        }
              
/*
            
            https.get(process.env.URL_API_MINHARECEITA + cnpjInserido, res => {
            let rawData = '';

            res.on('data', chunk => {
                rawData += chunk;
            });

            res.on('end', () => {
                const parsedData = JSON.parse(rawData);
                //console.log(parsedData.cnae_fiscal)
                //console.log(parsedData.cnaes_secundarios)
                respostaConsultaTabelas.codigosCnae[0] = parsedData.cnae_fiscal;
                respostaConsultaTabelas.descricaoCnae[0] = parsedData.cnae_fiscal_descricao;
                //console.log('CNAES SECUNDARIOS:::::    ' + parsedData.cnaes_secundarios[1].codigo);
                //var respostaConsultaTabelas.cnaesSecundarios[];
                for (var i = 0; i < parsedData.cnaes_secundarios.length; i++) {
                    console.log('CNAES SECUNDARIOS:::::    ' + parsedData.cnaes_secundarios[i].codigo);
                    respostaConsultaTabelas.codigosCnae[i + 1] = parsedData.cnaes_secundarios[i].codigo;
                    respostaConsultaTabelas.descricaoCnae[i + 1] = parsedData.cnaes_secundarios[i].descricao;
                }
                //respostaConsultaTabelas.cnaesSecudarios = parsedData.cnaes_secudarios;
            });
        })*/
        /*    
        }
        catch{
            console.log('não foi possivel buscar cnpj');
            respostaConsultaTabelas.status = 400;
            respostaConsultaTabelas.erro = true;
            respostaConsultaTabelas.mensagem = 'Erro: não foi possível consultar o CNPJ informado';
        }*/
    }



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
    /*
    var grauRiscoConsultado;
    var denominacaoCnaeConsultada;
    var codigoCnaeConsultado;
    */
    
    //console.log(codigoCnae1Inserido, numero_trabalhadores_inserido);
    console.log(respostaConsultaTabelas.codigosCnae[0], numero_trabalhadores_inserido);


    if(!respostaConsultaTabelas.erro)
    {
        //consulta tabela CNAEs
        const cnae_table = await NR04_Cnae_Gr.findAll({
            //consulta linha para encontrar o CNAE inserido

            where:{/*
                "codigo_cnae": {
                    [Op.or]: [codigoCnae1Inserido, codigoCnae2Inserido]
                    
                }   */  
                "codigo_cnae": respostaConsultaTabelas.codigosCnae[0]
            },
            //retorna os atributos listados
            attributes: ['id', 'codigo_cnae', 'denominacao', 'grau_risco']

            /*
            where:{
                "codigo_cnae": codigoCnae1Inserido,
            },
            //retorna os atributos listados
            attributes: ['id', 'codigo_cnae', 'denominacao', 'grau_risco']
            */
        })
        .then((cnae_table) => {
            if(cnae_table.length > 1){
                /*console.log("Com [1]<<<<<<<<<<");
                console.log(cnae_table[0]);
                console.log(cnae_table[1]);
                */
                
                if(cnae_table[0].grau_risco < cnae_table[1].grau_risco){
                    respostaConsultaTabelas.cnae = cnae_table[1].codigo_cnae;
                    respostaConsultaTabelas.denominacao = cnae_table[1].denominacao;
                    respostaConsultaTabelas.grauDeRisco = cnae_table[1].grau_risco;
                }
                else{
                    //se deu tudo certo, atribui os valores consultados a variável de resposta
                    respostaConsultaTabelas.cnae = cnae_table[0].codigo_cnae;
                    respostaConsultaTabelas.denominacao = cnae_table[0].denominacao;
                    respostaConsultaTabelas.grauDeRisco = cnae_table[0].grau_risco;
                }
            }
            else{
                //console.log("Sem [1]<<<<<<<<<<");
                //se deu tudo certo, atribui os valores consultados a variável de resposta
                respostaConsultaTabelas.cnae = cnae_table[0].codigo_cnae;
                respostaConsultaTabelas.denominacao = cnae_table[0].denominacao;
                respostaConsultaTabelas.grauDeRisco = cnae_table[0].grau_risco;
            }
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
    //consultar somente se nro trabalhadores >= 50
    if(!respostaConsultaTabelas.erro){
            //se o nro trabalhadores > 5000, realizar duas consultas, para 5000 e mais. Fazer o calculo
        if(respostaConsultaTabelas.nroTrabalhadores > 5000){
            
            //calcula fator de multiplicação para grupos acima de 5000
            var gruposAcima5000 = Math.floor((respostaConsultaTabelas.nroTrabalhadores-5000)/4000) + Math.floor(((respostaConsultaTabelas.nroTrabalhadores-5000)%4000)/2000);

            /*
            console.log(gruposAcima5000);

            console.log(Math.floor((respostaConsultaTabelas.nroTrabalhadores-5000)/4000));

            console.log(Math.floor(((respostaConsultaTabelas.nroTrabalhadores-5000)%4000)/2000));
            */

            //consulta tabela SESMT
            const sesmt_table = await NR04_Sesmt.findAll({
                //consulta pelo grau de risco consultado na tabela anterior
                //e pelo numero de trabalhadores informado entre os limites de cada faixa
                where:{
                    grau_risco: respostaConsultaTabelas.grauDeRisco,
                    //nro_trabalhadores_min: {[Op.gte]: respostaConsultaTabelas.nroTrabalhadores},
                    nro_trabalhadores_max: {[Op.gte]: 5000}
                },
                //retorna os seguintes atributos da tabela
                attributes: ['id', 'grau_risco', 'nro_trabalhadores_min', 'nro_trabalhadores_max', 'tecnico_seg','engenheiro_seg','aux_tec_enfermagem','enfermeiro','medico']
            })
            .then((sesmt_table) => {

                //console.log(sesmt_table[0]);
                //console.log(sesmt_table[1]);
                
                //se deu tudo certo, atribui os valores consultados a variável de resposta
                
                respostaConsultaTabelas.nroTrabalhadoresMinSesmt = 5001;
                respostaConsultaTabelas.nroTrabalhadoresMaxSesmt = '';
                respostaConsultaTabelas.tecnicoSeg = parseInt(sesmt_table[0].tecnico_seg) + parseInt(sesmt_table[1].tecnico_seg) * gruposAcima5000;
                respostaConsultaTabelas.engenheiroSeg = parseInt(sesmt_table[0].engenheiro_seg) + parseInt(sesmt_table[1].engenheiro_seg) * gruposAcima5000;
                respostaConsultaTabelas.auxTecEnfermagem = parseInt(sesmt_table[0].aux_tec_enfermagem) + parseInt(sesmt_table[1].aux_tec_enfermagem) * gruposAcima5000;
                respostaConsultaTabelas.enfermeiro = parseInt(sesmt_table[0].enfermeiro) + parseInt(sesmt_table[1].enfermeiro) * gruposAcima5000;
                respostaConsultaTabelas.medico = parseInt(sesmt_table[0].medico) + parseInt(sesmt_table[1].medico) * gruposAcima5000;
                
            })
            .catch(()=>{
                //se ocorreu algum erro, preenche informações para retornar ao front
                respostaConsultaTabelas.status = 400;
                respostaConsultaTabelas.erro = true;
                respostaConsultaTabelas.mensagem = 'Erro: Nenhum valor encontrado da base de dados da equipe SESMT.'      
            })            
        }
        else{
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
        
    }
    
    if(!respostaConsultaTabelas.erro)
    {
        if(respostaConsultaTabelas.nroTrabalhadores > 10000){
            //calcula fator de multiplicação para grupos acima de 5000
            var gruposAcima10000 = Math.floor((respostaConsultaTabelas.nroTrabalhadores-10000)/2500);
            //console.log('CIPA: ' + gruposAcima10000.toString());
            const cipa_table = await NR05_Cipa.findAll({
                //consulta pelo grau de risco consultado na tabela anterior
                //e pelo numero de trabalhadores informado entre os limites de cada faixa
                where:{
                    grau_risco: respostaConsultaTabelas.grauDeRisco,
                    nro_trabalhadores_max: {[Op.gte]: 10000}
                },
                //retorna os seguintes atributos da tabela
                attributes: ['id', 'grau_risco', 'nro_trabalhadores_min', 'nro_trabalhadores_max', 'integrantes_efetivos','integrantes_suplentes']
            })
            .then((cipa_table) => {
                //se deu tudo certo, atribui os valores consultados a variável de resposta
                respostaConsultaTabelas.nroTrabalhadoresMinCipa = cipa_table[0].nro_trabalhadores_min;
                respostaConsultaTabelas.nroTrabalhadoresMaxCipa = cipa_table[0].nro_trabalhadores_max;
                respostaConsultaTabelas.cipaEfetivos = parseInt(cipa_table[0].integrantes_efetivos) + parseInt(cipa_table[1].integrantes_efetivos) * gruposAcima10000;
                respostaConsultaTabelas.cipaSuplentes = parseInt(cipa_table[0].integrantes_suplentes) + parseInt(cipa_table[1].integrantes_suplentes) * gruposAcima10000;

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
        else{
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