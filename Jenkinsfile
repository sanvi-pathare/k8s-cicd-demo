pipeline {
    agent any

    environment {
        DOCKER_USERNAME = "your-dockerhub-username"
        APP_NAME = "student-dashboard"
        DOCKER_CREDS = "dockerhub-creds" // Docker Hub username/password
        KUBE_CREDS = "kubeconfig-creds"   // Your local ~/.kube/config file
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build & Tag Image') {
            steps {
                script {
                    env.IMAGE_TAG = sh(script: 'git rev-parse --short HEAD', returnStdout: true).trim()
                    env.DOCKER_IMAGE = "${DOCKER_USERNAME}/${APP_NAME}:${env.IMAGE_TAG}"
                    
                    echo "Building image: ${DOCKER_IMAGE}"
                    docker.build(env.DOCKER_IMAGE, ".")
                }
            }
        }

        stage('Push to Docker Hub') {
            steps {
                docker.withRegistry('https://registry.hub.docker.com', DOCKER_CREDS) {
                    docker.image(env.DOCKER_IMAGE).push()
                    
                    if (env.BRANCH_NAME == 'main') {
                        docker.image(env.DOCKER_IMAGE).push('latest')
                    }
                }
            }
        }

        stage('Deploy to Test (dev branch)') {
            when {
                branch 'dev'
            }
            steps {
                echo "Deploying ${env.DOCKER_IMAGE} to TEST namespace"
                // This step now uses your local kubeconfig
                withKubeConfig(credentialsId: KUBE_CREDS) {
                    sh "kubectl create namespace test --dry-run=client -o yaml | kubectl apply -f -"
                    sh "kubectl apply -f k8s/service.yaml --namespace test"
                    sh "kubectl apply -f k8s/deployment.yaml --namespace test"
                    sh "kubectl set image deployment/student-dashboard student-dashboard=${DOCKER_IMAGE} --namespace test"
                }
            }
        }

        stage('Deploy to Production (main branch)') {
            when {
                branch 'main'
            }
            steps {
                input 'Proceed with PRODUCTION deployment?'
                
                echo "Deploying ${DOCKER_IMAGE} to PRODUCTION namespace"
                // This step now uses your local kubeconfig
                withKubeConfig(credentialsId: KUBE_CREDS) {
                    sh "kubectl create namespace production --dry-run=client -o yaml | kubectl apply -f -"
                    sh "kubectl apply -f k8s/service.yaml --namespace production"
                    sh "kubectl apply -f k8s/deployment.yaml --namespace production"
                    sh "kubectl set image deployment/student-dashboard student-dashboard=${DOCKER_IMAGE} --namespace production"
                }
            }
        }
    }

    post {
        always {
            script {
                if (env.DOCKER_IMAGE) {
                    sh "docker rmi ${DOCKER_IMAGE}"
                }
            }
        }
    }
}