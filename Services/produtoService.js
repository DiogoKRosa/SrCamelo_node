import mongoose from 'mongoose'
import produto from "../models/produtos.js"

const Produto = mongoose.model("produtos", produto)

class produtoService {
    async popular(){
        var consultar = await Produto.count()
        if(consultar){
            return 0
        }
        let dados = await Produto.create([{
            "vendedor": "222.222.222-22",
            "nome": "Coxinha de frango",
            "preco": 12,
            "descricao": "Coxinha c/8 unidades",
            "categoria": "Salgado",
            "imagem": "1699833425560_222.222.222-22.jpg",
          },
          {
            "vendedor": "222.222.222-22",
            "nome": "Esfiha Aberta de Carne",
            "preco": 12,
            "descricao": "Esfiha de carne c/4",
            "categoria": "Salgado",
            "imagem": "1699833461116_222.222.222-22.jpg",
          },
          {
            "vendedor": "222.222.222-22",
            "nome": "Coca cola lata 350ml",
            "preco": 4.5,
            "descricao": "Coca-cola lata 350ml",
            "categoria": "Bebidas",
            "imagem": "1699833484221_222.222.222-22.jpg",
          },
          {
            "vendedor": "333.333.333-33",
            "nome": "Brigadeiro",
            "preco": 5,
            "descricao": "Bandeja e brigadeiro com 12unidades",
            "categoria": "Doces",
            "imagem": "1699833578211_333.333.333-33.jpg",
          }])
        console.log('Banco populado com produtos')
    }
    
    cadastrarProduto(dados){
        const novoProduto = new Produto({
            vendedor: dados.vendedor,
            nome: dados.nome,
            preco: dados.preco,
            descricao: dados.descricao,
            categoria: dados.categoria,
            imagem: dados.imagem
        })
        novoProduto.save()
    }

    async consultarProdutosVendedor(cpf){
        const produtos =  await Produto.find({vendedor: cpf})
        return produtos
    }
    async consultarProduto(id){
        const produto = await Produto.findOne({_id: id})
        return produto
    }

    async deletar(id){
        const resultado = await Produto.deleteOne({_id: id})
    }

    async editar(dados){
        var atualizar = {
            $set: {
                nome: dados.nome,
                preco: dados.preco,
                descricao: dados.descricao,
                imagem: dados.imagem,
            }
        }
        const resultado = await Produto.updateOne({_id: dados.id}, atualizar)
    }

    async pesquisarNome(nome){
        var result = await Produto.find({nome:{$regex : nome, $options : 'i'}})
        return result
    }

    async pesquisarCategoria(categoria){
        var result = await Produto.find({categoria: categoria})
        return result
    }
}

export default new produtoService