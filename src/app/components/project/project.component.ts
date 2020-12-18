import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
interface CardProp{
  title: string;
  description: string;
  link: string;
  img?: string;
}
@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.scss']
})
export class ProjectComponent implements OnInit {
  public cardList: Array<CardProp> = [
    {
      title: 'simulation',
      description: 'Some real world physical simulations',
      link: 'cloth',
      img: 'https://imgconvert.csdnimg.cn/aHR0cHM6Ly9tbWJpei5xcGljLmNuL21tYml6X2dpZi8yVzRJU0dYaEZ5T1F5S1c4MnJOdEFBaWFyMVlYcUVOdEtBdGRuVmo3ZGwzQXZhUVN5bFVvbTlIb3RFa2ljajh6NGNERk5lSXIzOTU1aGRkaGZlcHQ4RTZ3LzY0MA?x-oss-process=image/format,png'
    },
    {
      title: 'robot',
      description: 'robot simulation ,emphasis on motion simulation',
      link: 'animation',
      img: 'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1602936023093&di=4a9b536ac5c219e3ed0252e4f856250e&imgtype=0&src=http%3A%2F%2Fwww.welbot-tech.cn%2Fimg%2F970x647%2FUR5and10.png'
    },
    {
      title: 'building',
      description: 'smart building',
      link: 'build',
      img: 'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1602936278548&di=37ca037c20697a7a9bc2c42868fb806b&imgtype=0&src=http%3A%2F%2Fzt.ruiec.com%2Fstorage%2Fimage%2F181019%2FfKcE7thsZeZfoiCpFJwqoshPaA4jxdByQf03fYM5.jpeg'
    }
  ];
  constructor( private router:Router) { }

  ngOnInit(): void {
  }
  public gotoItem(link){
    this.router.navigate([`/world/${link}`]);
  }
}
