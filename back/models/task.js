module.exports = (sequelize, DataTypes) => {
    return sequelize.define('Task', {
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
            allowNull: false,
            validate: {
                notEmpty: {msg: "L'id ne doit pas etre vide."},
                notNull: {msg: "L'id est une propriétée requise."}
            }
        },
        projectId: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: {msg: "Le project id ne doit pas etre vide."},
                notNull: {msg: "Le project id est une propriétée requise."}
            }
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: { msg: "Le titre ne doit pas être vide." },
                len: { args: [2, 100], msg: "Le titre doit etre compris entre 2 et 100 caractères." },
                is: {args: /^[\wé èà\-\']*$/i, msg: "le titre ne doit contenir que des lettres et des chiffres"}
            }
        },
        description: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: { args: [0, 100], msg: "La description doit comprendre maximum 100 caractères." },
                is: {args: /^[\wé èà\-\']*$/im, msg: "la description ne doit contenir que des lettres et des chiffres"}
            }
        },
        checked: {
            type: DataTypes.TEXT,
            allowNull: true,
            get() {
                return this.getDataValue('checked').split(',')
            },
            set(checked) {
                this.setDataValue('checked', checked.join())
            }
        },
        subTask: {
            type: DataTypes.TEXT,
            allowNull: true,
            get() {
                return this.getDataValue('subTask').split(',')
            },
            set(subTask) {
                this.setDataValue('subTask', subTask.join())
            }
        },
        status: {
            type: DataTypes.STRING,
            allowNull: false
        }
    },{
        timestamps: true,
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
    });
};