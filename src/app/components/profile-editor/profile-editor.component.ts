import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup , FormBuilder, Validators, FormArray } from '@angular/forms';

@Component({
  selector: 'app-profile-editor',
  templateUrl: './profile-editor.component.html',
  styleUrls: ['./profile-editor.component.scss']
})
export class ProfileEditorComponent implements OnInit {
  // profileForm = new FormGroup({
  //   firstName: new FormControl(''),
  //   lastName: new FormControl(''),
  //   address: new FormGroup({
  //     street: new FormControl(''),
  //     city: new FormControl(''),
  //     state: new FormControl(''),
  //     zip: new FormControl('')
  //   })
  // });
  // this.heroForm = new FormGroup({
  //   'name': new FormControl(this.hero.name, [
  //     Validators.required,
  //     Validators.minLength(4),
  //     forbiddenNameValidator(/bob/i) // <-- Here's how you pass in the custom validator.
  //   ]),
  //   'alterEgo': new FormControl(this.hero.alterEgo),
  //   'power': new FormControl(this.hero.power, Validators.required)
  // });
  profileForm = this.fb.group({
    firstName: ['', Validators.required, Validators.minLength(4),],
    lastName: [''],
    address: this.fb.group({
      street: [''],
      city: [''],
      state: [''],
      zip: ['']
    }),
    aliases: this.fb.array([
      this.fb.control('')
    ])
  });
  constructor(private fb: FormBuilder){}
  ngOnInit(): void {
  }
  onSubmit() {
    // TODO: Use EventEmitter with form value
    console.warn(this.profileForm.value);
  }
  updateProfile() {
    this.profileForm.patchValue({
      firstName: 'Nancy',
      address: {
        street: '123 Drew Street'
      }
    });
  }
  get aliases() {
    return this.profileForm.get('aliases') as FormArray;
  }
  addAlias() {
    this.aliases.push(this.fb.control(''));
  }
}
