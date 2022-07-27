from flask_script import Manager
from flask_migrate import MigrateCommand, Migrate

from main import app
from core.db import db

migrate = Migrate(app=app, db=db)
manage = Manager(app)
manage.add_command('db', MigrateCommand)

if __name__ == '__main__':
    manage.run()
