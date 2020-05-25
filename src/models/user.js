import bcrypt from 'bcrypt'

const user = (sequelize, DataTypes) => {
  const User = sequelize.define('user', {
    username: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    age: {
      type: DataTypes.INTEGER,
    },
    country: {
      type: DataTypes.STRING
    },
    name: {
      type: DataTypes.STRING
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: {
        notEmpty: true,
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [7, 42],
      },
    },
  })

  User.associate = models => {
    //User.hasMany(models.Message, { onDelete: 'CASCADE' })
    //User.hasMany(models.Trip, { onDelete: 'CASCADE'})
    User.belongsTo(models.Role)
    User.belongsToMany(models.Room, { through: models.Reservation })
  }

  User.findByLogin = async login => {
    let user = await User.findOne({
      where: { username: login }
    })

    if (!user) {
      user = await User.findOne({
        where: { email: login }
      })
    }

    return user
  }

  User.beforeCreate(async user => {
    user.password = await user.generatePasswordHash()
  })

  User.prototype.generatePasswordHash = async function () {
    const saltRounds = 10
    return await bcrypt.hash(this.password, saltRounds)
  }

  User.prototype.validatePassword = function (password) {
    return bcrypt.compareSync(password, this.password);
  };

  return User
}

export default user