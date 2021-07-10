## REST API

Aplicacion realizada con ExpressJs, TypeScript y MongoDB
El proyecto se estructura de la siguiente forma:
1. La carpeta **models** contiente los archivos .ts que coresponden a cada uno de los modelos del requerimiento de la tarea.
2. La carpeta **routes** contriente las clases que se encargan del enrutamiento en express, por ejemplo vea el siguente ejemplo
donde se crea la clase CourseRouter, en el contructor recibe la instancia de express y registra los distintos endpoints para
las operaciones crud básicas.
``` javascript
  export class CourseRouter {
    private app: Express = undefined;
    private path: string = '/course';
    private authMidd: AuthMidd;

    constructor(_app: Express) {
        if (!_app) throw new Error('An express instance needed');
        this.app = _app;
        this.authMidd = new AuthMidd();
    }

    registerEndpoints() {
        this._list();
        this._create();
        this._update();
        this._listOne();
        this._delete();
    }
    // ... //
```
3. La carpeta **middlewares** contiene una clase con funciones comunes sobre toda la aplicacion como por ejemplo
la funcion que chequea sihay un usario logueado con un token valido para insertar elementos.
4. La carpeta  **seeders** contiene funciones inicializadoras en la bd,m como por ejemplo la insercion del primer usuario.

### Correr la aplicacion ###

la aplicacion corren en el siguiente host: **http://localhost:3333**
Las operaciones de edicion, insercion y borrado, estan protegidas, solo un user logeado las puede ejecutar.

Usted debe tener mongodb en su maquina local para la base de datos 
1. npm install
2. npm run serve

### Test
1. npm run test

### Las rutas requeridas
1. get **/report/student-credit-gte-50** devuelve los estudiantes con mas de 50 creditos 
2. get **/report/courses-hight-students** devuelve los cursos con mas estudiantes
3. get **/student/{id}** devuelve todos los datos del estudiante, asi como  los cursos con creditos
4. get **/course/{id}** devuelve todos los datos del curso, asi como los estudiantes que estan inscritos
5. get **/auth/login** permite la autenticacion en la aplicación implementa basic auth.
6. get **/api-docs** ejemplo de integracion con swagger
### Link publico al postman 
https://www.getpostman.com/collections/9192064e690a05c53c05