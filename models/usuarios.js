import mongoose from 'mongoose'

const usuarioSchema = mongoose.Schema(
    {
        tipo:String,
        nome:String,
        cpf:String,
        email:String,
        telefone:String,
        senha:String,
        cidade:String,
        uf:String,
        pagamento:[String],
        imagem:String
    }
)

export default usuarioSchema;