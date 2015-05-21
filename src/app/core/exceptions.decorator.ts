/// <reference path='../../types/types.ts'/>

angular
  .module('ngBoilerplate')
  .config(exceptionDecorator);

/* @ngInject */
function exceptionDecorator($provide: ng.auto.IProvideService) {
  $provide.decorator('$exceptionHandler',
     /* @ngInject */
    ($delegate: any, $log: ng.ILogService) => {
      return function(exception: string, cause: string) {
        // TODO: do whatever you want with errors
        $log.debug('ERROR:' + exception);
        $delegate(exception, cause);
      };
    }
  );
}
