const { Sequelize, DataTypes } = require('sequelize');
const UserModel = require('../models/user');
const ProjectModel = require('../models/project');
const TaskModel = require('../models/task');

const sequelize = new Sequelize(
    'react_kanban',
    'root',
    '',
    {
        host: 'localhost',
        dialect: 'mariadb',
        port: 3306,
        dialectOptions: {
            timezone: 'Etc/GMT-2',
            socketPath: '/opt/lampp/var/mysql/mysql.sock'
            /* for production 
            
            socketPath: '/var/run/mysqld/mysqld.sock',
           cachingRsaPublicKey: '/var/lib/mysql/public_key.pem', */
        },
        logging: false
    }
);

const User = UserModel(sequelize, DataTypes);
const Project = ProjectModel(sequelize, DataTypes);
const Task = TaskModel(sequelize, DataTypes);

module.exports = {  
    User, Project, Task
};