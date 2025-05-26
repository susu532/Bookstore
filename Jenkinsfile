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
                sh 'npm run build'
            }
        }

        stage('Déploiement') {
            when {
                branch 'main'
            }
            steps {
                sh 'echo "Déploiement fictif : ajoutez vos commandes de déploiement ici."'
            }
        }
    }
}
