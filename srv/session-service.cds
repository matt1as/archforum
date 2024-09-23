namespace archforum.cap;
using archforum.cap as my from '../db/schema';

@path: '/session'
service SessionService {
  entity Sessions as projection on my.Sessions;
}
