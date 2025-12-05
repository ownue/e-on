pipeline {
    agent any

    environment {
        DOCKERHUB_USERNAME = credentials('dockerhub-username')
        VITE_API_URL       = credentials('vite-base-url')
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Env Test') {
            steps {
                sh 'echo "DOCKERHUB_USERNAME=$DOCKERHUB_USERNAME"'
                sh 'echo "VITE_API_URL=$VITE_API_URL"'
            }
        }
    }

    post {
        always {
            cleanWs()
        }
    }
}
