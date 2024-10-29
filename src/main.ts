import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));

    const options = new DocumentBuilder()
        .setTitle('YouApp API')
        .setDescription('YouApp API Challenge')
        .setVersion('1.0')
        .addTag('YouApp-api')
        .addBearerAuth()
        .build();

    // Create the Swagger document
    const document = SwaggerModule.createDocument(app, options);

    // Set up Swagger module with the document
    SwaggerModule.setup('/docs', app, document);
    await app.listen(3000);
}


bootstrap();
