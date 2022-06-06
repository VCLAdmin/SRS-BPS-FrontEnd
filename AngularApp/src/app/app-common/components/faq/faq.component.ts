import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';


@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.css']
})
export class FaqComponent implements OnInit {
  showBackButton: any;
  constructor(private route: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    this.route.queryParamMap
      .subscribe((params) => {
        this.showBackButton = params.get('showBackButton')
      });
  }


  navigateToHome() {
    this.showBackButton = false;
    this.router.navigate(['home']);
  }

}
