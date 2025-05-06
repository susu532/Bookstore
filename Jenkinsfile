pipeline {
    agent any

    stages {
        stage('Cloner le repo') {
            steps {
                git 'https://github.com/utilisateur/mon-projet.git'
            }
        }

        stage('Installer les dépendances') {
            steps {
                sh 'npm install'
            }
        }

        stage('Tests unitaires') {
            steps {
                sh 'npm test'
            }
        }

        stage('Build') {
            steps {
                sh 'echo "Construire l'application..."'
            }
        }

        stage('Déploiement') {
            when {
                branch 'main'
            }
            steps {
                sh './scripts/deploy.sh'
            }
        }
    }
}
