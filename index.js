import express from 'express'
import path from 'path'
import session from 'express-session'
import mongoose from 'mongoose'
import multer from 'multer'

const app = express()


app.set('view engine', 'ejs')

app.use(express.static("public"))
app.use(express.static("uploads"))

app.use(express.urlencoded({extended: true}))
app.use(express.json())

app.use(session({
    resave: true,
    saveUninitialized: true,
    secret:'some string/hash secret'
}))

import Usuario from './Services/usuarioService.js'
import Produto from './Services/produtoService.js'
import Cartao from './Services/cartaoService.js'
import Pedido from './Services/pedidoService.js'

var storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, './uploads/')
    },
    filename: async function(req, file, cb){
        cb(null, `${Date.now()}_${req.session.cpf}.jpg`)
    }
})
var upload = multer({
    storage: storage,
})

function checkAuth(req, res, next) {
    if (!req.session.user_id) {
      res.send('Conexão Expirada');
    } else {
      next();
    }
}

let url = 'mongodb://127.0.0.1:27017/sr_camelo'
mongoose.connect(url, {useNewUrlParser: true, useUnifiedTopology: true})
    .then(()=>{
        console.log("Conectado ao Banco de Dados")
        Usuario.popular()
        Produto.popular()
        Pedido.popular()
        Cartao.popular()
        app.listen(8080, function(erro){
            if(erro){
                console.log("Ocorreu um erro")
            }else{
                console.log("Servidor iniciado com sucesso!")
            }
        })
    }).catch((err)=>{
        console.log(err)
    })

app.get("/", (req, res) => {
    res.render("index")
})
app.get("/logar", (req, res) => {
    res.render("logar", {erro: ''})
})
app.post("/logar", async (req, res) => {
    var login = await Usuario.consultarCpf(req.body.cpf).then(obj=>{
        return obj
    })
    if(login){
        if(login.senha == req.body.senha){
            req.session.user_id = login._id
            req.session.nome = login.nome
            req.session.cpf = login.cpf
            req.session.email = login.email
            req.session.telefone = login.telefone
            req.session.imagem = login.imagem
            req.session.tipo = login.tipo
            req.session.save()
            if(login.tipo == 'vendedor'){
                var consultarProdutos = await Produto.consultarProdutosVendedor(req.body.cpf)
                .then(obj => {
                    return obj
                })
                if(consultarProdutos == ''){
                    res.redirect("/primeiro-acesso/foto")
                }else{
                    res.redirect("/mapa")
                }
            }
            else{
                res.redirect("/mapa")
            }
        }
        else{
            res.render('logar', {erro:'Senha inválida'})
        }
    }else{
        res.render('logar', {erro:'Usuario não cadastrado'})
    }
})
app.get("/logout", (req, res)=>{
    req.session.destroy();
    res.redirect('/')
})

app.get("/mapa", checkAuth, (req, res) =>{
    res.render("mapa", {tipo: req.session.tipo})
})

app.get("/pagina-principal", checkAuth, async(req, res)=>{
    var vendedores = await Usuario.consultarVendedores(obj=>{
        return obj
    })

    var cpfs = []
    var p_historico = await Pedido.consultarPedidoCliente(req.session.cpf).then(obj=>{
        obj.forEach((pedido)=>{
            if(cpfs.indexOf(pedido.vendedor)===-1){
                cpfs.push(pedido.vendedor)
            }
        })
    })
    var vendedores_historico = await Usuario.consultarCpflista(cpfs).then(obj=>{
        return obj
    })
    .catch(err=>{
        console.log(err)
    })
    res.render("pagina-principal", {tipo: req.session.tipo, vendedores: vendedores, historico: vendedores_historico})
})
app.get("/pesquisa", checkAuth, async (req, res)=>{
    var categoria = req.query.categoria

    if(categoria){
        var produtos = await Produto.pesquisarCategoria(categoria).then(obj=>{
            return obj
        })
    }

    res.render('pesquisa', {tipo: req.session.tipo, produtos: produtos})
}) 
app.post("/pesquisa", checkAuth, async (req, res)=>{
    var pesquisa = req.body.pesquisa

    if(pesquisa){
        var produtos = await Produto.pesquisarNome(pesquisa).then(obj=>{
            return obj
        })
    }
    res.render('pesquisa', {tipo: req.session.tipo, produtos: produtos})
}) 

app.get("/pagina-vendedor/:cpf?", checkAuth, async (req, res) =>{
    var cpf = req.params.cpf

    if(cpf){
        var produtos = await Produto.consultarProdutosVendedor(cpf).then(obj=>{
            return obj
        })
        var vendedor = await Usuario.consultarCpf(cpf).then(obj=>{
            return obj
        })
        res.render("pagina-vendedor", {tipo: req.session.tipo, dados:vendedor, produtos: produtos})
    }else{
        var produtos = await Produto.consultarProdutosVendedor(req.session.cpf).then(obj=>{
            return obj
        })
        var vendedor = await Usuario.consultarCpf(req.session.cpf).then(obj=>{
            return obj
        })
        res.render("pagina-vendedor",{tipo: req.session.tipo, dados:vendedor, produtos: produtos})
    }
})


app.get("/produtos", checkAuth, async (req, res)=>{
    var result = await Produto.consultarProdutosVendedor(req.session.cpf).then((obj)=>{
        var dados = obj
        res.render("cadastro-produtos", {title: 'Produtos', dados: dados, foto:'', cadastro:'', tipo: req.session.tipo})
    })
})
app.get("/produtos", checkAuth, async (req, res) =>{
    var result = await Produto.consultarProdutosVendedor(req.session.cpf).then((obj)=>{
        var dados = obj
        res.render("cadastro-produtos", {title: 'Cadastro-Produtos', dados: dados, foto:'', cadastro:'', tipo: req.session.tipo})
    })
})
app.post("/inserir-foto-produtos/:id?", upload.single("produto"), async (req, res)=>{
    var id = req.params.id
    req.session.produtoAtual = req.file.filename

    var produtos = await Produto.consultarProdutosVendedor(req.session.cpf).then((obj)=>{
        var dados = obj
        return dados     
    })

    if(id){
        var editar = await Produto.consultarProduto(id).then((obj)=>{
            var dados = {
                id: obj._id,
                nome: req.body.nome,
                preco: req.body.preco,
                descricao: req.body.desc,
                imagem: req.session.produtoAtual,
                categoria: req.body.categoria
            }
            return dados
        })
        res.render("editar-produtos", {title: 'Editar-Produtos', dados:produtos, editar:editar, tipo: req.session.tipo})
    }else{
        var cadastro = {
            nome: req.body.nome,
            preco: req.body.preco,
            descricao: req.body.desc,
            imagem: req.session.produtoAtual,
            categoria: req.body.categoria
        }
        res.render("cadastro-produtos", {title: 'Cadastrar-Produtos', dados:produtos, cadastro:cadastro, tipo: req.session.tipo})
    }
})
app.post("/produtos", (req, res)=>{
    var produto = {
        vendedor: req.session.cpf,
        nome: req.body.nome,
        preco: req.body.preco,
        descricao: req.body.desc,
        categoria: req.body.categoria,
        imagem: req.session.produtoAtual
    }
    Produto.cadastrarProduto(produto)
    res.redirect("/produtos")
})
app.get("/deletar-produto/:id", async (req, res)=>{
    var id = req.params.id
    var result = await Produto.deletar({_id: id})
    res.redirect("/produtos")
})
app.get("/editar-produto/:id", async (req, res)=>{
    var id = req.params.id
    var editar = await Produto.consultarProduto(id).then((obj)=>{
        req.session.produtoAtual = obj.imagem
        return obj
    })
    var consulta = await Produto.consultarProdutosVendedor(req.session.cpf).then((obj)=>{
        obj
    })
    res.render("editar-produtos", {title:'Editar Produtos', editar:editar, dados:consulta, tipo: req.session.tipo})
})
app.post("/editar-produto/:id", async (req, res)=>{
    var update = {
            id: req.params.id,
            nome: req.body.nome,
            preco: req.body.preco,
            descricao: req.body.desc,
            categoria: req.body.categoria,
            imagem: req.session.produtoAtual
    }
    var result = await Produto.editar(update)
    res.redirect("/produtos")
})

app.get("/dados-cadastrais/:tipo", checkAuth, async (req, res)=>{
    var dados = await Usuario.consultarUsuario(req.session.user_id).then(obj=>{
        return obj
    })
    if(req.params.tipo == 'vendedor'){
        res.render("editar-dados-vendedor", {dados: dados, imagem: req.session.imagem, tipo:req.session.tipo})
    }else{
        var cartoes = await Cartao.consultarCartoes(req.session.cpf).then(obj=>{
            return obj
        })
        res.render("editar-dados-cliente", {dados: dados, tipo:req.session.tipo, cartoes:cartoes, editarCartao:''})
    }
})
app.post("/editar-banner", upload.single('banner'), async (req, res)=>{
    req.session.imagem = req.file.filename
    var dados = {
        tipo: req.session.tipo,
        nome: req.body.nome,
        email: req.body.email,
        telefone: req.body.telefone,
        cidade: req.body.cidade,
        uf: req.body.uf,
        pagamento: req.body.formaPagamento,
        imagem: req.session.imagem,
    }
    res.render("editar-dados-vendedor", {dados: dados, tipo:req.session.tipo})
})
app.post("/dados-cadastrais/:tipo", checkAuth, async (req, res)=>{
    if(req.params.tipo == 'vendedor'){
        var dados = {
            id: req.session.user_id,
            nome: req.body.nome,
            cpf: req.body.cpf,
            email: req.body.email,
            telefone: req.body.telefone,
            senha: req.body.senha,
            cidade: req.body.cidade,
            uf: req.body.uf,
            imagem: req.session.imagem,
            pagamento: req.body.formaPagamento
        }
        var result = Usuario.atualizarVendedor(dados)
        res.redirect("/dados-cadastrais/vendedor")
    }else{
        var dados = {
            id: req.session.user_id,
            nome: req.body.nome,
            cpf: req.body.cpf,
            email: req.body.email,
            telefone: req.body.telefone,
            senha: req.body.senha,
            cidade: req.body.cidade,
            uf: req.body.uf, 
        }
        var result = Usuario.atualizarCliente(dados)
        res.redirect("/dados-cadastrais/cliente")
    }
})
app.get("/cartao", checkAuth, async(req, res)=>{
    var cartoes = await Cartao.consultarCartoes(req.session.cpf).then(obj=>{
        return obj
    })
    res.render('cartao', {tipo:req.session.tipo , cartoes:cartoes, editarCartao:''})
})
app.post("/cartao/:acao/:id?", checkAuth, async(req, res)=>{
    var acao = req.params.acao
    var id = req.params.id
    if(acao == 'adicionar'){
        var add = {
            usuario: req.session.cpf,
            numero: req.body.nCartao,
            titular: req.body.titular,
            validade: req.body.dataValidade,
        }
        var result = await Cartao.adicionarCartao(add)
        var cartao = ''
    }else if(acao == 'editar'){
        var cartao = await Cartao.consultarCartao(id).then(obj=>{
            return obj
        })
    }else if(acao == 'deletar'){
        var cartao = {
            usuario: req.session.cpf,
            numero: req.body.nCartao,
            titular: req.body.titular,
            validade: req.body.dataValidade,
        }
        var result = await Cartao.deletarCartao(id)
    }else if(acao == 'atualizar'){
        var att = {
            id: id,
            usuario: req.session.cpf,
            numero: req.body.nCartao,
            titular: req.body.titular,
            validade: req.body.dataValidade,
        }
        var cartao = ''
        var result = await Cartao.atualizarCartao(att)
    }
    var cartoes = await Cartao.consultarCartoes(req.session.cpf).then(obj=>{
        return obj
    })
    res.render('cartao', {tipo:req.session.tipo , cartoes:cartoes, editarCartao:cartao})
})

app.get("/pedido/:cpf", checkAuth, async (req, res)=>{
    var cpf = req.params.cpf
    var produtos = await Produto.consultarProdutosVendedor(cpf)
    res.render('pedido', {tipo:req.session.tipo, produtos: produtos})
})
app.post("/pedido/:cpf", checkAuth, async (req, res)=>{
    var produtos = req.query.produtos
    var pedido = {
        status: 'Pendente',
        cliente: req.session.cpf,
        vendedor: req.params.cpf,
        produtos: req.query.produtos,
        forma: '',
        valor: '',
        data: '',
    }
    req.session.pedido = pedido
    res.render('extrato', {tipo: req.session.tipo, produtos: produtos})
})
app.get("/pagamento/:forma?", checkAuth, async(req, res)=>{
    var formas = await Usuario.consultarCpf(req.session.pedido.vendedor).then(obj=>{
        return obj.pagamento
    })
    var forma = req.params.forma
    req.session.pedido.forma = forma
    var data = new Date()
    req.session.pedido.data = data.toLocaleString('pt-BR')
    var cartoes = await Cartao.consultarCartoes(req.session.cpf).then(obj=>{
        return obj
    })
    if(forma == 'dinheiro'){
        res.redirect('/add-pedido')
    }else if(forma == 'debito'){
        res.render('pagar/debito', {tipo: req.session.tipo, total: req.session.pedido.valor, cartoes:cartoes})
    }else if(forma == 'credito'){
        res.render('pagar/credito', {tipo: req.session.tipo, total: req.session.pedido.valor, cartoes:cartoes})
    }else if(forma == 'pix'){
        res.render('pagar/pix', {tipo: req.session.tipo, total:req.session.pedido.valor, chave: req.session.telefone})
    }else{
        req.session.pedido.valor = req.query.total
        res.render('forma-pagamento', {tipo:req.session.tipo, total:req.session.pedido.valor, forma: formas})
    }
})
app.get('/add-pedido', checkAuth, async(req, res)=>{
    var result = await Pedido.adicionarPedido(req.session.pedido)
    res.redirect('/historico/cliente')
})
app.get('/historico/:tipo', checkAuth, async(req, res)=>{
    var tipo = req.params.tipo
    var cpfs = []
    if(tipo == 'vendedor'){
        var pedidos = await Pedido.consultarPedidoVendedor(req.session.cpf).then(obj=>{
            obj.forEach((pedido)=>{
                if(cpfs.indexOf(pedido.cliente)===-1){
                    cpfs.push(pedido.cliente)
                }
            })
            return obj
        })
    }else{
        var pedidos = await Pedido.consultarPedidoCliente(req.session.cpf).then(obj=>{
            obj.forEach((pedido)=>{
                if(cpfs.indexOf(pedido.vendedor)===-1){
                    cpfs.push(pedido.vendedor)
                }
            })
            return obj
        })
    }

    
    var usuarios = await Usuario.consultarCpflista(cpfs).then(obj=>{
        return obj
    })
    .catch(err=>{
        console.log(err)
    })
    res.render('historico', {tipo: req.session.tipo, pedidos:pedidos, usuarios: usuarios})
})
app.get('/atualizar-pedido/:acao', checkAuth, async(req, res)=>{
    var acao = req.params.acao
    var cod = req.query.cod

    var result = await Pedido.atualizarPedido(cod, acao)
    res.redirect('/historico/'+req.session.tipo)
})

app.get("/primeiro-acesso/foto", checkAuth, (req, res) =>{
    const dados = {
            nome: req.session.nome,
            email: req.session.email,
            telefone: req.session.telefone,
            foto: req.session.imagem
    }
    res.render("primeira-foto", {dados: dados, tipo: req.session.tipo})
})
app.post("/primeiro-acesso/foto", upload.single("banner"), async (req, res)=>{
    var result = await Usuario.atualizarFotoVendedor(req.session.user_id, req.file.filename)
    var result = await Usuario.consultarUsuario(req.session.user_id)
    .then(obj=>{
        req.session.imagem = obj.imagem
    })
    const dados = {
        nome: req.session.nome,
        email: req.session.email,
        telefone: req.session.telefone,
        foto: req.session.imagem,
        descricao: req.body.descricao
    }
    res.render("primeira-foto", {dados: dados})
})

app.get("/primeiro-acesso/produto", checkAuth, async (req, res) =>{
    var result = await Produto.consultarProdutosVendedor(req.session.cpf).then((obj)=>{
        var dados = obj
        res.render("cadastro-produtos-primeiro", {title: 'Cadastro-Produtos', dados: dados, foto:'', cadastro:''})
    })
})
app.post("/primeiro-acesso/inserir-foto-produtos/:id?", upload.single("produto"), async (req, res)=>{
    var id = req.params.id
    req.session.produtoAtual = req.file.filename
    var produtos = await Produto.consultarProdutosVendedor(req.session.cpf).then((obj)=>{
        var dados = obj
        return dados     
    })
    if(id){
        var editar = await Produto.consultarProduto(id).then((obj)=>{
            var dados = {
                id: obj._id,
                nome: req.body.nome,
                preco: req.body.preco,
                descricao: req.body.desc,
                imagem: req.session.produtoAtual,
                categoria: req.body.categoria
            }
            return dados
        })
        res.render("editar-produtos-primeiro", {title: 'Editar-Produtos', dados:produtos, editar:editar})
    }else{
        var cadastro = {
            nome: req.body.nome,
            preco: req.body.preco,
            descricao: req.body.desc,
            imagem: req.session.produtoAtual,
            categoria: req.body.categoria
        }
        res.render("cadastro-produtos-primeiro", {title: 'Cadastrar-Produtos', dados:produtos, cadastro:cadastro})
    }
})
app.post("/primeiro-acesso/produto", (req, res)=>{
    var produto = {
        vendedor: req.session.cpf,
        nome: req.body.nome,
        preco: req.body.preco,
        descricao: req.body.desc,
        categoria: req.body.categoria,
        imagem: req.session.produtoAtual
    }
    Produto.cadastrarProduto(produto)
    res.redirect("/primeiro-acesso/produto")
})
app.get("/primeiro-acesso/deletar-produto/:id", async (req, res)=>{
    var id = req.params.id
    var result = await Produto.deletar({_id: id})
    res.redirect("/primeiro-acesso/produto")
})
app.get("/primeiro-acesso/editar-produto/:id", async (req, res)=>{
    var id = req.params.id
    var editar = await Produto.consultarProduto(id).then((obj)=>{
        req.session.produtoAtual = obj.imagem
        return obj
    })
    var consulta = await Produto.consultarProdutosVendedor(req.session.cpf).then((obj)=>{
        obj
    })
    res.render("editar-produtos-primeiro", {title:'Editar Produtos', editar:editar, dados:consulta})
})
app.post("/primeiro-acesso/editar-produto/:id", async (req, res)=>{
    var update = {
            id: req.params.id,
            nome: req.body.nome,
            preco: req.body.preco,
            descricao: req.body.desc,
            categoria: req.body.categoria,
            imagem: req.session.produtoAtual
    }
    var result = await Produto.editar(update)
    res.redirect("/primeiro-acesso/produto")
})


app.get("/cadastro",(req, res) => {
    res.render("cadastro")
})
app.get("/cadastro-cliente",(req, res) => {
    res.render("cadastro-cliente", {error:''})
})
app.post("/cadastro-cliente", (req, res) => {
    if(req.body.senha == req.body.senhaConf){
        var usuario = {
            tipo: 'cliente',
            nome: req.body.nome,
            cpf: req.body.cpf,
            email: req.body.email,
            telefone: req.body.telefone,
            senha: req.body.senha,
            cidade: req.body.cidade,
            uf: req.body.uf
        }
        var result = Usuario.criarCliente(usuario)
        res.redirect("/logar")
    }else{
        res.render("cadastro-cliente", {error: "Senha divergentes"})
    }
})

app.get("/cadastro-vendedor",(req, res) => {
    res.render("cadastro-vendedor", {error: ''})
})
app.post("/cadastro-vendedor", (req, res) => {
    if(req.body.senha != req.body.senhaConf){
        res.render("cadastro-vendedor", {error: "Senha divergentes"})
    }else{
        var usuario = ({
            tipo: 'vendedor',
            nome: req.body.nome,
            cpf: req.body.cpf,
            email: req.body.email,
            telefone: req.body.telefone,
            senha: req.body.senha,
            cidade: req.body.cidade,
            uf: req.body.uf,
            imagem: '',
            pagamento: req.body.formaPagamento
        })
        var result = Usuario.criarVendedor(usuario)
        res.redirect("/logar")
    }
})
