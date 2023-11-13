import mongoose from 'mongoose'

const pedidoSchema = mongoose.Schema(
    {   
        status: String,
        cliente: String,
        vendedor: String,
        produtos: [String],
        forma: String,
        valor: Number,
        data: Date
    }
)

export default pedidoSchema