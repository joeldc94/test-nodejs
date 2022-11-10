const Sequelize = require('sequelize');

// conexão com banco de dados
const sequelize = new Sequelize('previsio_db', 'root', 'Previsio2022', {
  host: 'localhost',
  dialect: 'mysql'
});


sequelize.authenticate()
.then(() => {
    console.log("Conexão com banco de dados realizada com sucesso!");
}).catch(() => {
    console.log("Erro: conexão com banco de dados não realizada com sucesso!");
})

module.exports = sequelize;