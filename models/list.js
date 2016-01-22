module.exports = function(sequelize, DataTypes) {
  	return sequelize.define('List', { listname:  DataTypes.STRING });
}
