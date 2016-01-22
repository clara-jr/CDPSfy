/* 

Modelo de datos de canciones (track)

track_id: {
	name: nombre de la canción,
	url: url del fichero de audio
} 

*/

// Definicion del modelo de Tracks

module.exports = function(sequelize, DataTypes) {
  	return sequelize.define('Tracks',
            { name:  DataTypes.STRING,
              url: DataTypes.STRING,
		      image: DataTypes.STRING
            });
}