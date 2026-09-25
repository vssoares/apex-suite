import { Component } from '@angular/core';
import { Icon } from '../../../../shared/ui/icon/icon';
import { Button } from '../../../../shared/ui/button/button';
import { StatusDot } from '../../../../shared/ui/status-dot/status-dot';

@Component({
  selector: 'app-action-footer',
  imports: [Icon, Button, StatusDot],
  templateUrl: './action-footer.html',
  styleUrl: './action-footer.scss',
})
export class ActionFooter {}
