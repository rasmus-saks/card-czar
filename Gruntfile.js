module.exports = function(grunt) {

  grunt.initConfig({
    jshint: {
      files: ['Gruntfile.js', 'src/**/*.js', 'test/**/*.js', 'public/js/**.js'],
      options: {
        globals: {
          jQuery: true
        },
        node: true,
        esversion: 6
      }
    },
    exec: {
      deploy: "eb deploy"
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-exec');

  grunt.registerTask('default', ['jshint']);
  grunt.registerTask('deploy', ['jshint', 'exec']);

};
