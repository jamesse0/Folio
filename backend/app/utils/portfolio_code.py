import secrets
import string

from app.dao.interfaces.portfolio_dao import PortfolioDAOInterface

ALPHABET = string.ascii_uppercase + string.digits


def generate_code() -> str:
    return "".join(secrets.choice(ALPHABET) for _ in range(8))


def generate_unique_code(portfolio_dao: PortfolioDAOInterface) -> str:
    while True:
        code = generate_code()
        if not portfolio_dao.code_exists(code):
            return code