import mongoose from 'mongoose'

const produtoSchema = mongoose.Schema(
    {   
        vendedor: String,
        nome: String,
        preco: Number,
        descricao: String,
        categoria: String,
        imagem: String
    }
)

export default produtoSchema