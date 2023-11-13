import mongoose from 'mongoose'

const cartaoSchema = mongoose.Schema(
    {   
        usuario: String,
        numero: String,
        titular: String,
        validade: String
    }
)

export default cartaoSchema