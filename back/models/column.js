module.exports = (sequelize, DataTypes) => {
    return sequelize.define('Column', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true,
            validate: {
                notEmpty: {msg: "L'id ne doit pas etre vide."},
                notNull: {msg: "L'id est une propriétée requise."}
            }
        },
        projectId: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: {msg: "Le createur ne doit pas etre vide."},
                notNull: {msg: "Le createur est une propriétée requise."}
            }
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: { msg: "Le nom de la colenne ne doit pas être vide." },
                len: { args: [2, 100], msg: "Le nom de la colenne doit etre compris entre 2 et 100 caractères." },
                is: {args: /^[\wé èà\-\']*$/i, msg: "le nom de la colenne ne doit contenir que des lettres et des chiffres"}
            }
        },
        color: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: { msg: "Le titre ne doit pas être vide." },
                is: {args: /^[\w\#]*$/i, msg: "la couleur n epeut contenir que des chiffres, lettres et #."}
            }
        },
    },{
        timestamps: true,
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
    });
};