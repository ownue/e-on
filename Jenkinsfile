pipeline {
    agent any

    environment {
        PROJECT_ID    = 'utopian-bonito-457808-c8'      // GCP 프로젝트 ID
        CLUSTER_NAME  = 'k8s'                      // GKE 클러스터 이름
        LOCATION      = 'asia-northeast3-a'        // GKE 지역 (zone)
        CREDENTIALS_ID = 'gcp-sa-jenkins'          // Jenkins Credentials ID (서비스 계정 키)

        // --- Docker Hub & 프론트엔드 설정 ---
        DOCKERHUB_USERNAME = credentials('dockerhub-username')  // Docker Hub ID (secret text)
        VITE_API_URL       = credentials('vite-base-url')       // 프론트에서 쓸 API 주소

        // 이미지 이름
        BE_IMAGE_NAME = "${DOCKERHUB_USERNAME}/e-on-backend"
        FE_IMAGE_NAME = "${DOCKERHUB_USERNAME}/e-on-frontend"

        DOCKER_API_VERSION = '1.41'
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
                  echo "=== Build backend image ==="
                  docker build -t ${BE_IMAGE_NAME}:latest -f backend/Dockerfile ./backend
                """
            }
        }

        stage('Build Frontend') {
            steps {
                sh """
                  echo "=== Build frontend image ==="
                  docker build --build-arg VITE_API_URL=${VITE_API_URL} \
                    -t ${FE_IMAGE_NAME}:latest -f frontend/Dockerfile ./frontend
                """
            }
        }

        stage('Push Images to Docker Hub') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerhub-id',   // Username/Password 타입
                        usernameVariable: 'USER',
                        passwordVariable: 'PASS'
                    )
                ]) {
                    sh """
                      echo "=== Docker Hub login ==="
                      echo "${PASS}" | docker login -u "${USER}" --password-stdin

                      echo "=== Push images ==="
                      docker push ${BE_IMAGE_NAME}:latest
                      docker push ${FE_IMAGE_NAME}:latest

                      docker logout
                    """
                }
            }
        }

        stage('Deploy to GKE') {
            when {
                branch 'main'   // 여전히 main 에서만 배포
            }
            steps {
                echo "=== Deploy to GKE with kubectl ==="

                // 서비스 계정 키를 파일로 받아오기
                withCredentials([file(credentialsId: 'gcp-sa-jenkins', variable: 'GOOGLE_CLOUD_KEYFILE_JSON')]) {
                    sh """
                    echo ">>> gcloud auth"
                    gcloud auth activate-service-account --key-file="$GOOGLE_CLOUD_KEYFILE_JSON"

                    echo ">>> gcloud config set project"
                    gcloud config set project ${PROJECT_ID}

                    echo ">>> get-credentials for cluster ${CLUSTER_NAME}"
                    gcloud container clusters get-credentials ${CLUSTER_NAME} \\
                        --zone ${LOCATION} \\
                        --project ${PROJECT_ID}

                    echo ">>> kubectl apply manifests"
                    kubectl apply -f k8s/mysql-deployment.yaml
                    kubectl apply -f k8s/backend-deployment.yaml
                    kubectl apply -f k8s/frontend-deployment.yaml

                    echo ">>> kubectl get pods"
                    kubectl get pods -o wide
                    """
                }
            }
        }
    }

    post {
        always {
            echo 'Cleaning up Jenkins workspace...'
            cleanWs()
        }
    }
}
