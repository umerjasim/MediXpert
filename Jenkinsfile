pipeline {
    agent any

    environment {
        DOCKER_HUB_CREDENTIALS = credentials('dockerhub-credentials')
        BACKEND_IMAGE = "umerjasim/medixpert-api"
        FRONTEND_IMAGE = "umerjasim/medixpert-app"
        RAILWAY_API_URL = "https://api.railway.app/project/YOUR_PROJECT_ID/deploy"
        RAILWAY_API_TOKEN = "60132630-82fb-41b9-98fb-320e60332e11"
    }

    stages {
        stage('Checkout Code') {
            steps {
                git branch: 'main', url: 'https://github.com/umerjasim/MediXpert.git'
            }
        }

        stage('Build Backend Docker Image') {
            steps {
                sh "docker build -t $BACKEND_IMAGE ./medixpert-api"
            }
        }

        stage('Push Backend Docker Image') {
            steps {
                sh "docker login -u $DOCKER_HUB_CREDENTIALS_USR -p $DOCKER_HUB_CREDENTIALS_PSW"
                sh "docker push $BACKEND_IMAGE"
            }
        }

        stage('Build Frontend Docker Image') {
            steps {
                sh "docker build -t $FRONTEND_IMAGE ./medixpert-app"
            }
        }

        stage('Push Frontend Docker Image') {
            steps {
                sh "docker push $FRONTEND_IMAGE"
            }
        }

        stage('Deploy to Railway') {
            steps {
                sh "curl -X POST \"$RAILWAY_API_URL\" -H \"Authorization: Bearer $RAILWAY_API_TOKEN\""
            }
        }
    }
}
