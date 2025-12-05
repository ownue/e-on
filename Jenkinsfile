pipeline {
    agent any

    environment {
        PROJECT_ID    = 'education-on-474706'
        CLUSTER_NAME  = 'eon-cluster-1'
        LOCATION      = 'asia-northeast3-a'
        CREDENTIALS_ID = 'gcp-sa-key'

        DOCKERHUB_ID_TEXT = credentials('dockerhub-id-text')
        VITE_API_URL      = credentials('vite-api-url')

        BE_IMAGE_NAME = "${DOCKERHUB_ID_TEXT}/e-on-backend"
        FE_IMAGE_NAME = "${DOCKERHUB_ID_TEXT}/e-on-frontend"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Backend') {
            steps {
                sh """
                  docker build -t ${BE_IMAGE_NAME}:latest -f backend/Dockerfile ./backend
                """
            }
        }

        stage('Build Frontend') {
            steps {
                sh """
                  docker build --build-arg VITE_API_URL=${VITE_API_URL} \
                    -t ${FE_IMAGE_NAME}:latest -f frontend/Dockerfile ./frontend
                """
            }
        }

        stage('Push Images') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerhub-id',
                        usernameVariable: 'USER',
                        passwordVariable: 'PASS'
                    )
                ]) {
                    sh """
                      echo "${PASS}" | docker login -u "${USER}" --password-stdin
                      docker push ${BE_IMAGE_NAME}:latest
                      docker push ${FE_IMAGE_NAME}:latest
                      docker logout
                    """
                }
            }
        }

        stage('Deploy to GKE') {
            when {
                branch 'main'
            }
            steps {
                step([
                    $class: 'KubernetesEngineBuilder',
                    projectId:         env.PROJECT_ID,
                    clusterName:       env.CLUSTER_NAME,
                    location:          env.LOCATION,
                    manifestPattern:  'k8s/*.yaml',
                    credentialsId:     env.CREDENTIALS_ID,
                    verifyDeployments: true
                ])
            }
        }
    }

    post {
        always {
            echo 'Cleaning workspace...'
            cleanWs()
        }
    }
}
