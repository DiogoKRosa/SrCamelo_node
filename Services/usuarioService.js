import mongoose from 'mongoose'
import usuario from "../models/usuarios.js"
const Usuario = mongoose.model("usuario", usuario)


class UsuarioService {
    async popular(){
        var consultar = await Usuario.count()

        if(consultar){
            return 0
        }
        let dados = await Usuario.create([{
            "tipo": "cliente",
            "nome": "Gabriel",
            "cpf": "111.111.111-11",
            "email": "gabriel@gmail.com",
            "telefone": "(13)99777-5422",
            "senha": "123",
            "cidade": "Registro",
            "uf": "SP",
            "pagamento": [],
          },
          {
            "tipo": "vendedor",
            "nome": "Leonardo",
            "cpf": "222.222.222-22",
            "email": "leonardo.salgados@gmail.com",
            "telefone": "(13)99756-2811",
            "senha": "123",
            "cidade": "Registro",
            "uf": "SP",
            "pagamento": [
              "dinheiro",
              "debito",
              "pix"
            ],
            "imagem": "1699833415710_222.222.222-22.jpg",
          },
          {
            "tipo": "vendedor",
            "nome": "Doces Maria",
            "cpf": "333.333.333-33",
            "email": "maria.doces@gmail.com",
            "telefone": "(13)99755-3366",
            "senha": "123",
            "cidade": "Registro",
            "uf": "SP",
            "pagamento": [
              "dinheiro",
              "pix"
            ],
            "imagem": "1699833573935_333.333.333-33.jpg",
    }])
    console.log("Banco populado com usuários")
}

    criarCliente(dados){
        const novoUsuario = new Usuario({
            tipo:dados.tipo,
            nome:dados.nome,
            cpf:dados.cpf,
            email:dados.email,
            telefone:dados.telefone,
            senha:dados.senha,
            cidade:dados.cidade,
            uf:dados.uf,
        })
        novoUsuario.save()
    }

    criarVendedor(dados){
        const novoUsuario = new Usuario({
            tipo:dados.tipo,
            nome:dados.nome,
            cpf:dados.cpf,
            email:dados.email,
            telefone:dados.telefone,
            senha:dados.senha,
            cidade:dados.cidade,
            uf:dados.uf,
            pagamento: dados.pagamento,
            imagem: dados.imagem
        })
        novoUsuario.save()
    }

    consultarCpf(cpf){
        const usuario =  Usuario.findOne({cpf: cpf}).then(obj=>{
            return obj
        })
        return usuario
    }

    consultarUsuario(id){
        const usuario = Usuario.findOne({_id: id})
        return usuario
    }

    async atualizarFotoVendedor(id, imagem){
        var atualizar ={
            $set:{
                imagem: imagem
            }
        }
        await Usuario.updateOne({_id: id}, atualizar)
    }

    async atualizarVendedor(dados){
        var upload = {
            $set: {
            nome: dados.nome,
            cpf: dados.cpf,
            email: dados.email,
            telefone: dados.telefone,
            senha: dados.senha,
            cidade: dados.cidade,
            uf: dados.uf,
            imagem: dados.imagem,
            pagamento: dados.pagamento
            }
        }
        await Usuario.updateOne({_id: dados.id}, upload)
    }

    async atualizarCliente(dados){
        var upload = {
            $set: {
            nome: dados.nome,
            cpf: dados.cpf,
            email: dados.email,
            telefone: dados.telefone,
            senha: dados.senha,
            cidade: dados.cidade,
            uf: dados.uf,
            }
        }
        await Usuario.updateOne({_id: dados.id}, upload)
    }

    async consultarVendedores(){
        var result = await Usuario.find({tipo:'vendedor'})
        return result
    }

    async consultarCpflista(...lista){
        var result = await Usuario.find({cpf: {$in: lista[0] }})
        return result
    }
}

export default new UsuarioService