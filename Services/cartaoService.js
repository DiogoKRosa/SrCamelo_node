import mongoose from 'mongoose'
import cartao from "../models/cartoes.js"

const Cartao = mongoose.model("cartoes", cartao)

class cartaoService {
    async popular(){
        var consultar = await Cartao.count()
        if(consultar){
            return 0
        }
        var dados = Cartao.create([{
            "usuario": "111.111.111-11",
            "numero": "1234 1234 1234 1234",
            "titular": "GABRIEL LEGAL MARIANO",
            "validade": "10/27"
          }])
        console.log('Banco populados com cartões')
    }

    adicionarCartao(dados){
       const novoCartao = new Cartao({
            usuario: dados.usuario,
            numero: dados.numero,
            titular: dados.titular,
            validade: dados.validade
       })
       novoCartao.save()
    }

    async consultarCartoes(cpf){
        var result = await Cartao.find({usuario: cpf})
        return result
    }

    async consultarCartao(id){
        var result = await Cartao.findOne({_id: id})
        return result
    }

    async deletarCartao(id){
        var result = await Cartao.deleteOne({_id: id})
    }

    async atualizarCartao(dados){
        var atualizar = {
            $set:{
                numero: dados.numero,
                titular: dados.titular,
                validade: dados.validade
            }
        }
        await Cartao.updateOne({_id: dados.id}, atualizar)
    }
}

export default new cartaoService