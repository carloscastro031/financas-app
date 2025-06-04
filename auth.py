import jwt
from flask import request, jsonify
from functools import wraps

CHAVE_SECRETA = "sua_chave_secreta_super_segura"

def gerar_token(usuario_id):
    return jwt.encode({"usuario_id": usuario_id}, CHAVE_SECRETA, algorithm="HS256")

def verificar_token(f):
    @wraps(f)
    def decorador(*args, **kwargs):
        token = request.headers.get("Authorization")
        if not token:
            return jsonify({"erro": "Token ausente"}), 401
        try:
            dados = jwt.decode(token, CHAVE_SECRETA, algorithms=["HS256"])
            return f(dados["usuario_id"], *args, **kwargs)
        except jwt.ExpiredSignatureError:
            return jsonify({"erro": "Token expirado"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"erro": "Token inválido"}), 401
    return decorador
