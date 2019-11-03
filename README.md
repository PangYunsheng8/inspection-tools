# InspectionTools

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 8.3.9.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).

---
### 日志
##### 10.21
接手量产检测工具项目，了解需求，看老版本的代码。
##### 10.22
学习蓝牙协议以及传输协议
##### 10.23
改bug。
##### 10.24
实现新检测工具的蓝牙连接功能
##### 10.25
写componet
##### 10.26
休息
##### 10.27
写完动态检测中6个侧面轴检测的基本功能
##### 10.28
写完布局，导航，动态检测和静态检测的任务栏等
1. 经过多次反复的改变后，最终确定了一个布局。用angular-material的stepper以及element-ui的collapse完成类似任务条的效果(不清楚一个项目中既用angular-material，又用element-ui这种做法是否妥当，是不是用一个统一的更好？)
2. 添加了一些iconfont。由于之前iconfont用的不熟悉，在这里耗了很多时间，遇到的一个问题是，我的iconfont文件夹放到了src目录下，没有放到src/assets目录下(这是正确的)，导致iconfont死活显示不出来。
3. 写完了导航栏。
##### 10.29
1. 改Network Error的bug。在连接蓝牙后，经常会报错Network Error。
原因是：老版本的检测工具在一个componet中获取蓝牙设备的所有信息，并且所有信息只获取一次。在新的检测工具中，将原来的功能拆分成了不同的component，每个componet初始化时，都会向蓝牙设备发送请求，获取相关信息。当存在不同的component同时请求同一条信息时，造成了通讯阻塞，因此报错`Network Error，GATT server has in process`。
解决办法：将获取蓝牙设备信息的功能不分给各个component，用一个service(ble-current-state.service)保存蓝牙设备信息，在连接蓝牙设备后即同步地发送所有获取蓝牙相关信息的请求，并保存在ble-current-state.service中，其他compoent到这个服务中获取需要的数据，避免了不同component同时发送同一请求造成阻塞。
2. 改动态检测bug。动态检测存在的一个bug是：在连接蓝牙设备后，当用户还没有点击动态检测的任务栏时，可能由于种种原因转动魔方，这时动态检测也会捕获到rotate行为，因此可能存在用户打开动态检测任务栏后，发现已经有几个轴被检测过了的问题。
原因是：没有添加限定条件，在连接蓝牙后即开始订阅传感器的数据。
解决办法：添加限定条件，只有当用户点击了动态检测任务栏后，才开始订阅传感器传来的数据。
3. 使用了ion-menu，将cube-information.component加到了页面上。
##### 10.30
1. 解决在不刷新页面的情况下，连续连接两个设备，前一个设备的数据没有清理的问题。在不刷新页面的情况下，如果连接了一个设备，ble-current-state.service会保存该设备的相关信息，由于保存在ble-current-state.service里的数据没有清理，此时如果断开连接并连接另一个设备，会发现检测结果仍保留了前一个设备的信息。
解决方法：清理前一个设备的信息
2. 解决在不刷新页面的情况下，连续连接两个相同设备，第二个设备断开连接时会报错`Cannot read property 'error' of`的bug。
造成该问题的原因是：第一个设备的`gattserverdisconnected`监听事件没有销毁。一开始我以为必须要手动添加removeEventListener才能销毁监听事件。但是好像断开连接时，server会自动销毁(这个还不确定)。但是实际的问题是，在addEventListener时用了匿名函数，导致无法正常销毁。查阅资料发现，addEventListener和removeEventListener不能用匿名函数来作callback，因为两者的匿名函数并不是同一个函数(地址空间不同)。
解决办法：改addEventListener中的匿名函数为有名字的函数作为callback。
3. 发现了一个bug。在转动魔方时，朝着同一个方向慢速转，会偶尔出现反方向的circle，造成实际转动角度与动态检测中的角度不匹配的问题。
原因：底层算法的问题，不属于本工具内的范畴。
##### 10.31
##### 11.01
##### 11.02
休息
##### 11.03
1. 添加动态检测的重新检查功能。重新检查功能分为两种:1)重新检查某个轴，2)重新检查所有轴。在检测魔方的过程中，若axisInterfereCount参数改变，会提示工人该轴疑似不良品，建议重新检测，工人可根据出问题的轴单独重新检测某个轴，或者重新检测所有轴。此外，更新了重新检测与查看结果的一致性，如果有项目重新检查，将重新检查的项目同步到检查结果中。
2. 更新静态检查与查看结果的一致性。当静态检查项目被检查或断开连接时，同时更新检查结果中的信息。
3. 动态检测逻辑中添加axisInterfereCount参数的影响。如果转动魔方过程中coderErrorCount不变，但是axisInterfereCount发生改变，那么将该轴置为不合格，同时提示用户该轴疑似不良品，建议重新检测。
4. 添加一些其他的小功能:1)断开连接后，静态检查项目中的图标变为等待。2)在没有连接的状态下，如果用户点击了重新检查或重新检查某个轴的图片，则弹出消息提示框告诉用户没有已连接的设备。
