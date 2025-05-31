from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Usuario(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    senha = db.Column(db.String(200), nullable=False)  # hash da senha

    def __repr__(self):
        return f"<Usuario {self.email}>"


class Lancamento(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey("usuario.id"), nullable=False)

    descricao = db.Column(db.String(200), nullable=False)
    tipo = db.Column(db.String(20), nullable=False)  # 'receita' ou 'despesa'
    categoria = db.Column(db.String(50), nullable=True)
    valor = db.Column(db.Float, nullable=False)
    data = db.Column(db.String(10), nullable=False)  # Formato: 'YYYY-MM-DD'
    formaPagamento = db.Column(db.String(50), nullable=True)
    banco = db.Column(db.String(50), nullable=True)
    status = db.Column(db.String(50), nullable=True)
    is_fixo = db.Column(db.Boolean, default=False)  # 👈 NOVO CAMPO

    usuario = db.relationship("Usuario", backref=db.backref("lancamentos", lazy=True))

    def __repr__(self):
        return f"<Lancamento {self.descricao} - {self.valor}>"
