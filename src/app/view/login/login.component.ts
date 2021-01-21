import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd';
import io from 'socket.io-client';
import { UserService } from 'src/app/service/user/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  
  validateForm!: FormGroup;
  registerForm!: FormGroup;


  constructor(
    private fb: FormBuilder,
    private httpService: UserService,
    private router: Router,
    private messageService: NzMessageService
  ) { }

  ngOnInit(): void {
    this.validateForm = this.fb.group({
      userName: [null, [Validators.required]],
      password: [null, [Validators.required]],
      remember: [true]
    });
  }
  async login(): Promise<void> {
    // tslint:disable-next-line: forin
    for (const i in this.validateForm.controls) {
      this.validateForm.controls[i].markAsDirty();
      this.validateForm.controls[i].updateValueAndValidity();
    }
    if(!this.validateForm.controls['userName'].value && !this.validateForm.controls['password'].value){
      this.messageService.error('username or password can not be null')
    }
    try{
      await this.httpService.login({
        name: this.validateForm.controls['userName'].value,
        password:this.validateForm.controls['password'].value
      }).toPromise();
      this.router.navigate(['/world'])
    }catch(err){
      this.messageService.error(err.error.message)
    }

  }
  register(){
    this.router.navigate(['/register'])
  }
}
