pipeline {
    agent any

    environment {
        DOCKERHUB_ID_TEXT = credentials('dockerhub-id-text')
        VITE_API_URL = credentials('vite-api-url')
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Env Test') {
            steps {
                sh 'echo "DockerHub ID: $DOCKERHUB_ID_TEXT"'
                sh 'echo "VITE API URL: $VITE_API_URL"'
            }
        }
    }

    post {
        always {
            cleanWs()
        }
    }
}
