import os

from flask_script import Manager
from flask_migrate import Migrate, MigrateCommand

from ClassISapp import create_app, db, websocket


app = create_app(os.getenv('FLASK_CONFIG') or 'default')

manager = Manager(app)
migrate = Migrate(app, db)

manager.add_command('db', MigrateCommand)
#manager.add_command('run', websocket.run(app=app, host='0.0.0.0', port=5000))  #覆盖自带的app

if __name__ == '__main__':
    manager.run()




