# Fighting-Gold

[//]: # (head-end)

* [Во-первых](#Во-первых)
* [Установка](#Установка)
* [Запуск](#Запуск)
* [Создать администратора](#Создать-администратора)

# Во-первых
Перед запускам, необходимо установить следующие:
1. [NodeJS](https://nodejs.org/en/)
2. [MongoDB](https://www.mongodb.com/download-center/community)

Далее клонировать проект
```
git clone https://github.com/Blancduman/fighting-gold.git
```

# Установка
Открыть терминал в папке с проектом
```
cd backend
npm install # установка зависимостей серверной части
cd ../app
npm install # установка зависимостей клиентской части
```
Далее, вам необходимо изменить файл **config**, указав свои параметры:
```
Fighting-Gold
  ├───app
  │   ├───Components
  │   ├───Constants
  │   ├───Containers
  │   ├───helper
  │   ├───Reducers
  │   ├───App.js
  │   ├───config.js  <--- Этот файл
  │   └───index.js
  └───backend    
      ├───constants
      ├───controllers
      ├───middleware
      ├───models
      ├───public
      ├───AddAdmin.js
      ├───config.js  <--- Этот файл
      ├───constants
      └───constants
```

# Запуск
1. Запустить MongoDB:

    Создать путь: _(ваш_путь_до_папки)/MongoDB/**data/db**_
```
cd (ваш_путь_до_папки)/MongoDB/bin
mongod --dbpath=../data/db
```
2. Запустить сервер:
```
cd backend
node index
```
3. Запустить клиента:
```
cd app
npm run start
```

# Создать-администратора
В **config.js** файле указывается логин, пароль и почта нового администратора.
```
cd fighting-gold/backend
node addAdmin
```
[//]: # (foot-start)

[{]: <helper> (navStep)


[}]: #
