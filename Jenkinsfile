pipeline {
    agent any

    environment {
        PROJECT_ID    = 'education-on-474706'     // GCP 프로젝트 ID
        CLUSTER_NAME  = 'eon-cluster-1'           // GKE 클러스터 이름
        LOCATION      = 'asia-northeast3-a'       // GKE 지역
        CREDENTIALS_ID = 'gcp-sa-key'             // Jenkins Credentials ID (서비스 계정 키)

        // --- Docker Hub & 프론트엔드 설정 ---
        DOCKERHUB_ID_TEXT = credentials('dockerhub-id-text')  // Docker Hub ID만 들어있는 Secret text
        VITE_API_URL      = credentials('vite-api-url')       // 프론트엔드에서 쓸 API 주소

        // 이미지 이름
        BE_IMAGE_NAME = "${DOCKERHUB_ID_TEXT}/e-on-backend"
        FE_IMAGE_NAME = "${DOCKERHUB_ID_TEXT}/e-on-frontend"
    }

    stages {
        stage('Checkout') {
            steps {
                // 멀티브랜치 파이프라인에서는 이게 정답!
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
                        credentialsId: 'dockerhub-id',     // Username/Password 타입으로 만든 그거
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
            // main 브랜치에서만 배포되도록 조건
            when {
                branch 'main'
            }
            steps {
                echo "=== Deploy to GKE (Rolling Update) ==="

                step([
                    $class: 'KubernetesEngineBuilder',
                    projectId:      env.PROJECT_ID,
                    clusterName:    env.CLUSTER_NAME,
                    location:       env.LOCATION,
                    manifestPattern:'k8s/*.yaml',   // 배포 yaml들 경로
                    credentialsId:  env.CREDENTIALS_ID,
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
