from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from models.models import db, Usuario, Lancamento
print("✅ Iniciando app.py")

app = Flask(__name__)
CORS(app)

# Configurações
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///db.sqlite'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'secreto-do-app'

db.init_app(app)
jwt = JWTManager(app)

# Inicializa banco
with app.app_context():
    db.create_all()

@app.route("/")
def home():
    return jsonify({"mensagem": "API do app financeiro rodando com autenticação!"})

# ============ AUTENTICAÇÃO ============

@app.route("/registro", methods=["POST"])
def registro():
    data = request.get_json()

    if not data.get("email") or not data.get("senha"):
        return jsonify({"erro": "Email e senha são obrigatórios"}), 400

    if Usuario.query.filter_by(email=data["email"]).first():
        return jsonify({"erro": "Email já registrado"}), 400

    novo = Usuario(
        email=data["email"],
        senha=generate_password_hash(data["senha"])
    )

    db.session.add(novo)
    db.session.commit()
    return jsonify({"mensagem": "Usuário registrado com sucesso!"})

@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    usuario = Usuario.query.filter_by(email=data["email"]).first()

    if not usuario or not check_password_hash(usuario.senha, data["senha"]):
        return jsonify({"erro": "Credenciais inválidas"}), 401

    token = create_access_token(identity=str(usuario.id))
    return jsonify({"token": token})

# ============ ROTAS PROTEGIDAS (Lançamentos) ============

@app.route("/lancamentos", methods=["GET"])
@jwt_required()
def listar_lancamentos():
    usuario_id = get_jwt_identity()
    lancamentos = Lancamento.query.filter_by(usuario_id=usuario_id).all()

    resultado = [
        {
            "id": l.id,
            "descricao": l.descricao,
            "tipo": l.tipo,
            "categoria": l.categoria,
            "valor": l.valor,
            "data": l.data,
            "formaPagamento": l.formaPagamento,
            "banco": l.banco,
            "status": l.status
        }
        for l in lancamentos
    ]

    return jsonify(resultado)

@app.route("/lancamentos", methods=["POST"])
@jwt_required()
def adicionar_lancamento():
    usuario_id = get_jwt_identity()
    raw_data = request.get_json()
    print("📥 Dados recebidos:", raw_data)

    campos_validos = {
        "descricao", "tipo", "categoria", "valor", "data",
        "formaPagamento", "banco", "status"
    }

    data = {k: v for k, v in raw_data.items() if k in campos_validos}

    if not data.get("descricao") or not data.get("tipo") or not data.get("data") or not data.get("valor"):
        return jsonify({"erro": "Campos obrigatórios faltando"}), 422

    try:
        valor = float(data.get("valor"))
    except ValueError:
        return jsonify({"erro": "Valor inválido"}), 422

    try:
        novo = Lancamento(
            usuario_id=usuario_id,
            descricao=data.get("descricao", ""),
            tipo=data.get("tipo", ""),
            categoria=data.get("categoria", ""),
            valor=valor,
            data=data.get("data", ""),
            formaPagamento=data.get("formaPagamento", ""),
            banco=data.get("banco", ""),
            status=data.get("status", "")
        )
        db.session.add(novo)
        db.session.commit()

        return jsonify({
            "id": novo.id,
            "descricao": novo.descricao,
            "tipo": novo.tipo,
            "categoria": novo.categoria,
            "valor": novo.valor,
            "data": novo.data,
            "formaPagamento": novo.formaPagamento,
            "banco": novo.banco,
            "status": novo.status
        })
    except Exception as e:
        print("❌ Erro ao salvar lançamento:", str(e))
        return jsonify({"erro": "Erro interno ao salvar lançamento"}), 500

@app.route("/lancamentos/<int:id>", methods=["DELETE"])
@jwt_required()
def excluir_lancamento(id):
    usuario_id = get_jwt_identity()
    lancamento = Lancamento.query.get_or_404(id)

    if str(lancamento.usuario_id) != str(usuario_id):
        return jsonify({"erro": "Acesso negado"}), 403

    db.session.delete(lancamento)
    db.session.commit()
    return jsonify({"mensagem": "Lançamento deletado com sucesso!"})

@app.route("/lancamentos/<int:id>", methods=["PUT"])
@jwt_required()
def atualizar_lancamento(id):
    usuario_id = get_jwt_identity()
    lancamento = Lancamento.query.get_or_404(id)
    raw_data = request.get_json()
    print("📥 Dados recebidos para update:", raw_data)

    if str(lancamento.usuario_id) != str(usuario_id):
        return jsonify({"erro": "Acesso negado"}), 403

    campos_validos = {
        "descricao", "tipo", "categoria", "valor", "data",
        "formaPagamento", "banco", "status"
    }

    data = {k: v for k, v in raw_data.items() if k in campos_validos}

    try:
        lancamento.descricao = data.get("descricao", lancamento.descricao)
        lancamento.tipo = data.get("tipo", lancamento.tipo)
        lancamento.categoria = data.get("categoria", lancamento.categoria)
        lancamento.valor = float(data.get("valor", lancamento.valor))
        lancamento.data = data.get("data", lancamento.data)
        lancamento.formaPagamento = data.get("formaPagamento", lancamento.formaPagamento)
        lancamento.banco = data.get("banco", lancamento.banco)
        lancamento.status = data.get("status", lancamento.status)

        db.session.commit()
        return jsonify({"mensagem": "Lançamento atualizado com sucesso!"})
    except Exception as e:
        print("❌ Erro ao atualizar lançamento:", str(e))
        return jsonify({"erro": "Erro interno ao atualizar lançamento"}), 500

if __name__ == "__main__":
    print("🚀 Iniciando servidor Flask...")
    app.run(debug=True)
