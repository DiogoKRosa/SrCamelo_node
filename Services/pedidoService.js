import mongoose from 'mongoose'
import pedido from "../models/pedidos.js"

const Pedido = mongoose.model("pedidos", pedido)

class pedidoService {
    async popular(){
        var consultar = await Pedido.count()
        if(consultar){
            return 0
        }
        var dados = await Pedido.create([{
            "status": "Pendente",
            "cliente": "111.111.111-11",
            "vendedor": "222.222.222-22",
            "produtos": [
              "{\"cod\":\"6551666d438e572a671d95e1\",\"nome\":\"Coxinha de frango\",\"qtde\":1,\"valor\":12}",
              "{\"cod\":\"655166a3438e572a671d95e9\",\"nome\":\"Coca cola lata 350ml\",\"qtde\":1,\"valor\":4.5}"
            ],
            "forma": "pix",
            "valor": 16.5,
            data: new Date("2023-12-12T00:02:36Z")
          },
          {
            "status": "Entregue",
            "cliente": "111.111.111-11",
            "vendedor": "333.333.333-33",
            "produtos": [
              "{\"cod\":\"65516770438e572a671d95f8\",\"nome\":\"Brigadeiro\",\"qtde\":2,\"valor\":5}"
            ],
            "forma": "pix",
            "valor": 10,
            data: new Date("2023-12-12T00:03:06Z")
          }])
          console.log('Banco populado com pedidos')
    }

    adicionarPedido(pedido){
        const novoPedido = new Pedido({
                status: pedido.status,
                cliente: pedido.cliente,
                vendedor: pedido.vendedor,
                produtos: pedido.produtos,
                forma: pedido.forma,
                valor: pedido.valor,
                data: pedido.data 
        })
        novoPedido.save()
    }

    async consultarPedidoVendedor(cpf){
        var pedidos = await Pedido.find({vendedor: cpf})
        return pedidos
    }
    
    async consultarPedidoCliente(cpf){
        var pedidos = await Pedido.find({cliente: cpf})
        return pedidos
    }

    async atualizarPedido(cod, status){
        await Pedido.updateOne({_id: cod}, {$set:{status: status}})
    }
}

export default new pedidoService