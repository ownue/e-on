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
                checkout scm   // 멀티브랜치에서는 이게 정답
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
                branch 'main'   // main 에서만 배포
            }
            steps {
                echo "=== Deploy to GKE (Rolling Update) ==="

                step([
                    $class: 'KubernetesEngineBuilder',
                    projectId:         env.PROJECT_ID,
                    clusterName:       env.CLUSTER_NAME,
                    location:          env.LOCATION,
                    manifestPattern:   'k8s/eon-all.yaml',   // 배포 yaml 경로
                    credentialsId:     env.CREDENTIALS_ID,
                    verifyDeployments: true
                ])
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
