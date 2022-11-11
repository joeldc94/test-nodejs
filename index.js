const express = require('express');
const cors = require('cors');
const app = express();

const Home = require('./models/Home');
const MsgContact = require('./models/MsgContact');

app.use(express.json());

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
    res.header("Access-Control-Allow-Headers", "X-PINGOTHER, Content-Type, Authorization");
    app.use(cors());
    next();
});


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